import mongoose from "mongoose";
import sellermodel from "../model/sellermodel.js";
import addproductmodel from "../model/addproduct.js";
import SellerNotification from "../model/sellerNotification.js";
import { sendEmail } from "../config/mail.js";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const INACTIVITY_THRESHOLD_DAYS = 30;
const WARNING_MESSAGE = "You haven't posted anything to sell in the last one month. We'll be deactivating your account soon. If you need any help contact us.";

const buildObjectIdList = (ids) => ids.map((id) => new mongoose.Types.ObjectId(id));

const fetchLatestProductDates = async (sellerIds) => {
  if (!sellerIds.length) return {};

  const pipeline = [
    { $match: { sellerId: { $in: buildObjectIdList(sellerIds) } } },
    { $group: { _id: "$sellerId", lastProduct: { $max: "$createdAt" } } }
  ];

  const rows = await addproductmodel.aggregate(pipeline);
  return rows.reduce((acc, row) => {
    acc[row._id.toString()] = row.lastProduct;
    return acc;
  }, {});
};

const createSellerWarning = async (seller, inactivityDays) => {
  await SellerNotification.create({
    sellerId: seller._id,
    title: "Action needed: add new listings",
    message: WARNING_MESSAGE,
    category: "inactivity",
    severity: inactivityDays >= 60 ? "critical" : "warning",
    metadata: { inactivityDays }
  });

  try {
    await sendEmail(
      seller.email,
      "We miss your listings on GNG",
      `<p>Hi ${seller.name || "Seller"},</p>
       <p>${WARNING_MESSAGE}</p>
       <p>Best,<br/>GNG Seller Success Team</p>`
    );
  } catch (error) {
    console.warn("Failed to send inactivity email", seller.email, error.message);
  }
};

export const runSellerInactivitySweep = async () => {
  const thresholdDate = new Date(Date.now() - INACTIVITY_THRESHOLD_DAYS * DAY_IN_MS);

  const candidates = await sellermodel.find({
    $or: [
      { lastProductPostedAt: { $exists: false } },
      { lastProductPostedAt: { $lt: thresholdDate } }
    ]
  }).select("name email lastProductPostedAt inactiveNotificationSentAt inactiveSince date status");

  if (!candidates.length) {
    return { checked: 0, warningsSent: 0 };
  }

  const needsBackfill = candidates.filter((seller) => !seller.lastProductPostedAt).map((seller) => seller._id.toString());
  const lastProductMap = await fetchLatestProductDates(needsBackfill);

  let warningsSent = 0;
  for (const seller of candidates) {
    const sellerId = seller._id.toString();
    const fallbackDate = seller.lastProductPostedAt || lastProductMap[sellerId] || seller.date;

    if (!fallbackDate) continue;

    if (fallbackDate >= thresholdDate) {
      if (!seller.lastProductPostedAt || seller.lastProductPostedAt.getTime() !== fallbackDate.getTime()) {
        seller.lastProductPostedAt = fallbackDate;
        await seller.save();
      }
      continue;
    }

    if (seller.inactiveNotificationSentAt && seller.inactiveNotificationSentAt >= thresholdDate) {
      continue;
    }

    const inactivityDays = Math.floor((Date.now() - new Date(fallbackDate).getTime()) / DAY_IN_MS);
    await createSellerWarning(seller, inactivityDays);

    seller.lastProductPostedAt = fallbackDate;
    seller.inactiveSince = fallbackDate;
    seller.inactiveNotificationSentAt = new Date();
    await seller.save();

    warningsSent += 1;
  }

  console.log(`Seller inactivity sweep complete: checked ${candidates.length}, warnings ${warningsSent}`);
  return { checked: candidates.length, warningsSent };
};

let inactivityIntervalHandle = null;

export const scheduleSellerInactivitySweep = () => {
  runSellerInactivitySweep().catch((error) => console.error("Seller inactivity sweep failed", error));

  if (inactivityIntervalHandle) {
    clearInterval(inactivityIntervalHandle);
  }

  inactivityIntervalHandle = setInterval(() => {
    runSellerInactivitySweep().catch((error) => console.error("Seller inactivity sweep failed", error));
  }, DAY_IN_MS);
};
