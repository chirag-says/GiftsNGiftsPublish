import { useEffect, useState } from "react";
import api from "../utils/api";

const useSellerDocuments = () => {
  const [data, setData] = useState({ documents: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await api.get("/api/seller/onboarding/documents/all");

        if (res.data.success) {
          const cleanDocs = {};

          Object.entries(res.data.documents || {}).forEach(
            ([group, docs]) => {
              const filtered = {};

              Object.entries(docs || {}).forEach(([key, doc]) => {
                if (doc?.url) {
                  filtered[key] = doc;
                }
              });

              if (Object.keys(filtered).length > 0) {
                cleanDocs[group] = filtered;
              }
            }
          );

          setData({ documents: cleanDocs });
        } else {
          setError("Failed to load documents");
        }
      } catch {
        setError("Unable to fetch documents");
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, []);

  return { data, loading, error };
};

export default useSellerDocuments;
