import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../utils/api";
import { normalizeProductRecord } from "../utils/productStatus.js";

export const useSellerProducts = () => {
  const [rawProducts, setRawProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const stoken = localStorage.getItem("stoken");

  const fetchProducts = useCallback(async () => {
    // If we rely on cookies, we might assume the user is logged in or the API will return 401
    // We don't check for stoken in localStorage anymore.

    try {
      setLoading(true);
      const { data } = await api.get("/api/product/getproducts");

      if (Array.isArray(data?.data)) {
        setRawProducts(data.data);
        setError(null);
      } else {
        setRawProducts([]);
        setError("Unable to load products.");
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Error fetching products.");
      setRawProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const products = useMemo(() => rawProducts.map(normalizeProductRecord), [rawProducts]);

  return {
    products,
    rawProducts,
    loading,
    error,
    refresh: fetchProducts,
  };
};
