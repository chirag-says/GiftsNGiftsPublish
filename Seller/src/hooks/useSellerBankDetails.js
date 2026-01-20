import { useEffect, useState } from "react";
import api from "../utils/api";

const useSellerBankDetails = () => {
  const [bankDetails, setBankDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBankDetails = async () => {
      try {
        const res = await api.get("/seller/onboarding/bank-details");
        if (res.data.success) {
          setBankDetails(res.data.bankDetails);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch bank details");
      } finally {
        setLoading(false);
      }
    };

    fetchBankDetails();
  }, []);

  return { bankDetails, loading, error };
};

export default useSellerBankDetails;
