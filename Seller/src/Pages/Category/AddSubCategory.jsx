import React, { useState, useEffect } from "react";
import { Button, Alert, CircularProgress } from "@mui/material";
import { MdOutlineCloudUpload, MdInfo, MdPending, MdCheckCircle, MdCancel } from "react-icons/md";
import api from "../../utils/api";
import { toast } from "react-toastify";

function AddSubCategory({ onSubCategoryAdded, className = "" }) {
  const [subCategoryName, setSubCategoryName] = useState("");
  const [reason, setReason] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [approved, setApproved] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Fetch seller's existing requests
  const [myRequests, setMyRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  useEffect(() => {
    api
      .get("/api/getcategories")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Error fetching categories", err));
  }, []);

  const submitSubcategoryRequest = async (e) => {
    e.preventDefault();

    if (!subCategoryName.trim()) {
      toast.error("Please enter a subcategory name");
      return;
    }

    if (!selectedCategory) {
      toast.error("Please select a parent category");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/api/subcategory-requests/request", {
        subcategory: subCategoryName.trim(),
        categoryId: selectedCategory,
        reason: reason.trim()
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setSubmitted(true);
        setSubCategoryName("");
        setReason("");
        setSelectedCategory("");
        fetchMyRequests(); // Refresh the list
        onSubCategoryAdded?.(response.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error submitting subcategory request:", error);
      toast.error(error.response?.data?.message || "Failed to submit subcategory request");
    } finally {
      setLoading(false);
    }
  };

  const fetchSeller = async () => {
    try {
      const res = await api.get("/api/seller/sellerdetails");
      if (res.data.success) {
        setApproved(res.data.seller[0].approved);
      }
    } catch (error) {
      console.error("Error fetching seller:", error);
    }
  };

  const fetchMyRequests = async () => {
    setLoadingRequests(true);
    try {
      const res = await api.get("/api/subcategory-requests/my-requests");
      if (res.data.success) {
        setMyRequests(res.data.requests);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchSeller();
    fetchMyRequests();
  }, []);

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <MdPending className="text-sm" /> Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <MdCheckCircle className="text-sm" /> Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <MdCancel className="text-sm" /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  if (!approved) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="bg-red-50 border border-red-300 text-red-700 text-center px-10 py-10 rounded-lg shadow-md max-w-xl w-full">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p>You are not approved to request subcategories.</p>
          <p>Please contact the administrator for approval.</p>
        </div>
      </div>
    );
  }

  return (
    <section className={`flex flex-col items-center p-6 max-h-[90vh] overflow-y-auto ${className}`}>
      <div className="w-full max-w-xl bg-white rounded-2xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-2">Request New Subcategory</h2>
        <p className="text-center text-gray-500 text-sm mb-6">
          Your request will be reviewed by admin before the subcategory is added.
        </p>

        {/* Info Alert */}
        <Alert severity="info" className="!mb-6" icon={<MdInfo className="text-xl" />}>
          <strong>Note:</strong> Subcategories need admin approval. Once approved, the subcategory will be available for all sellers.
        </Alert>

        {/* Success State */}
        {submitted && (
          <Alert severity="success" className="!mb-6">
            <strong>Request Submitted!</strong> Your subcategory request has been sent for admin review.
          </Alert>
        )}

        <form onSubmit={submitSubcategoryRequest} className="space-y-6">
          {/* Parent Category */}
          <div>
            <label className="block mb-2 text-sm font-medium">
              Parent Category <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Category --</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.categoryname}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory Name */}
          <div>
            <label className="block mb-2 text-sm font-medium">
              Subcategory Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subCategoryName}
              onChange={(e) => setSubCategoryName(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter subcategory name"
              maxLength={50}
            />
            <p className="text-xs text-gray-400 mt-1">{subCategoryName.length}/50 characters</p>
          </div>

          {/* Reason/Description */}
          <div>
            <label className="block mb-2 text-sm font-medium">
              Reason/Description <span className="text-gray-400">(Optional)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why should this subcategory be added? What products will it contain?"
              className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
              maxLength={300}
            />
            <p className="text-xs text-gray-400 mt-1">{reason.length}/300 characters</p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            className="!mt-6 !bg-blue-600 hover:!bg-blue-700 text-white font-semibold !py-3 px-4 rounded-lg flex items-center justify-center gap-2"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <MdOutlineCloudUpload className="text-[22px]" />}
          >
            {loading ? "Submitting..." : "Submit Subcategory Request"}
          </Button>
        </form>
      </div>

      {/* My Previous Requests */}
      {myRequests.length > 0 && (
        <div className="bg-white mt-6 rounded-xl w-full max-w-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold mb-4">My Subcategory Requests</h3>

          {loadingRequests ? (
            <div className="flex justify-center py-4">
              <CircularProgress size={24} />
            </div>
          ) : (
            <div className="space-y-3">
              {myRequests.map((req) => (
                <div key={req._id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50">
                  <div className="w-10 h-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {req.subcategory.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{req.subcategory}</p>
                    <p className="text-xs text-gray-500">
                      in {req.categoryName || req.category?.categoryname} • {new Date(req.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    {getStatusBadge(req.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default AddSubCategory;
