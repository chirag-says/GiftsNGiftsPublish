import { useEffect, useState, useCallback } from "react";
import api from "../utils/api";

const useSellerBusinessDetails = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBusinessDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/seller/profile/business-details");
      setData(res.data);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load business details"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBusinessDetails();
  }, [fetchBusinessDetails]);

  return {
    data,
    loading,
    error,
    refetch: fetchBusinessDetails, // ✅ VERY IMPORTANT
  };
};

export default useSellerBusinessDetails;
