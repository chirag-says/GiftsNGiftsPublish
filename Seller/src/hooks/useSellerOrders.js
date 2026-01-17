import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../utils/api";
import { computeOrderStats } from "../utils/orderMetrics";

export const useSellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const stoken = localStorage.getItem("stoken"); // Removed

  const fetchOrders = useCallback(async () => {
    // If we rely on cookies, we might assume the user is logged in or the API will return 401
    // We don't check for stoken in localStorage anymore.

    try {
      setLoading(true);
      const { data } = await api.get("/api/seller/orders");

      if (data.success) {
        setOrders(data.filteredOrders || []);
        setError(null);
      } else {
        setOrders([]);
        setError(data.message || "Failed to fetch orders.");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      // The api interceptor might handle 401 redirects, but we can set error here too
      setError("Error fetching orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const stats = useMemo(() => computeOrderStats(orders), [orders]);

  return {
    orders,
    setOrders,
    loading,
    error,
    stats,
    refresh: fetchOrders,
  };
};
