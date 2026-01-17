import React, { useState, useEffect } from "react";
import { MdOutlineCloudUpload, MdInfo, MdPending, MdCheckCircle, MdCancel } from "react-icons/md";
import { Button, Alert, CircularProgress } from "@mui/material";
import api from "../../utils/api";
import { toast } from "react-toastify";

function AddCategory({ onClose }) {
  const [approved, setApproved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [category, setCategory] = useState({
    categoryname: "",
    reason: "",
    image: null,
  });
  const [preview, setPreview] = useState("");

  // Fetch seller's existing requests
  const [myRequests, setMyRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const handleCategoryChange = (e) => {
    setCategory({ ...category, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only JPG, PNG, and WebP images are allowed");
        return;
      }
      setCategory({ ...category, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const submitCategoryRequest = async (e) => {
    e.preventDefault();

    if (!category.categoryname.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    if (!category.image) {
      toast.error("Please select an image for the category");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("categoryname", category.categoryname.trim());
    formData.append("image", category.image);
    formData.append("reason", category.reason.trim());

    try {
      const response = await api.post(
        "/api/category-requests/request",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setSubmitted(true);
        setCategory({ categoryname: "", reason: "", image: null });
        setPreview("");
        fetchMyRequests(); // Refresh the list
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error submitting category request:", error);
      toast.error(error.response?.data?.message || "Failed to submit category request");
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
      const res = await api.get("/api/category-requests/my-requests");
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

  // Get status badge color and icon
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
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="bg-red-50 border border-red-300 text-red-700 text-center px-10 py-16 rounded-lg shadow-md max-w-xl w-full">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p>You are not approved to request categories.</p>
          <p>Please contact the administrator for approval.</p>
        </div>
      </div>
    );
  }

  return (
    <section className="flex flex-col items-center px-4 max-h-[90vh] overflow-y-auto">
      <div className="bg-white !mt-10 rounded-xl w-full max-w-lg p-8 !pb-10 shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-2">Request New Category</h2>
        <p className="text-center text-gray-500 text-sm mb-6">
          Your request will be reviewed by admin before the category is added.
        </p>

        {/* Info Alert */}
        <Alert severity="info" className="!mb-6" icon={<MdInfo className="text-xl" />}>
          <strong>Note:</strong> Categories need admin approval. Once approved, the category will be available for all sellers.
        </Alert>

        {/* Success State */}
        {submitted && (
          <Alert severity="success" className="!mb-6">
            <strong>Request Submitted!</strong> Your category request has been sent for admin review. You'll be notified once it's approved.
          </Alert>
        )}

        <form onSubmit={submitCategoryRequest} className="space-y-6">
          {/* Category Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="categoryname"
              value={category.categoryname}
              onChange={handleCategoryChange}
              placeholder="Enter category name"
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={50}
            />
            <p className="text-xs text-gray-400 mt-1">{category.categoryname.length}/50 characters</p>
          </div>

          {/* Reason/Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Reason/Description <span className="text-gray-400">(Optional)</span>
            </label>
            <textarea
              name="reason"
              value={category.reason}
              onChange={handleCategoryChange}
              placeholder="Why should this category be added? What products will it contain?"
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
              maxLength={300}
            />
            <p className="text-xs text-gray-400 mt-1">{category.reason.length}/300 characters</p>
          </div>

          {/* Category Image */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Category Image <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
                id="category-image-input"
              />
              <label htmlFor="category-image-input" className="cursor-pointer">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="mx-auto w-32 h-32 object-cover rounded-md border"
                  />
                ) : (
                  <div className="py-4">
                    <MdOutlineCloudUpload className="mx-auto text-4xl text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Click to upload image</p>
                    <p className="text-xs text-gray-400">JPG, PNG, WebP (max 5MB)</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              className="!bg-blue-600 hover:!bg-blue-700 text-white flex items-center justify-center gap-2 !py-3"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <MdOutlineCloudUpload />}
            >
              {loading ? "Submitting..." : "Submit Category Request"}
            </Button>
          </div>
        </form>
      </div>

      {/* My Previous Requests */}
      {myRequests.length > 0 && (
        <div className="bg-white mt-6 rounded-xl w-full max-w-lg p-6 shadow-lg mb-10">
          <h3 className="text-lg font-bold mb-4">My Category Requests</h3>

          {loadingRequests ? (
            <div className="flex justify-center py-4">
              <CircularProgress size={24} />
            </div>
          ) : (
            <div className="space-y-3">
              {myRequests.map((req) => (
                <div key={req._id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50">
                  <img
                    src={req.image?.url}
                    alt={req.categoryname}
                    className="w-12 h-12 rounded-md object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{req.categoryname}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(req.createdAt).toLocaleDateString('en-IN', {
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

export default AddCategory;
