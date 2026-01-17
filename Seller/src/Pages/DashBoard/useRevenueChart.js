import { useEffect, useState } from "react";
import api from "../../utils/api";

export const useRevenueChart = (period = "week") => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenue();
  }, [period]);

  const fetchRevenue = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/api/seller-panel/analytics/revenue?period=${period}`
      );

      const chart = res.data.data.chartData || [];

      setData(
        chart.map(d => ({
          label: d.name,       // Jan 6, Jan 7
          revenue: d.revenue,  // number
        }))
      );
    } catch {
      // fallback (same image style)
      setData([
        { label: "Jan 6", revenue: 120 },
        { label: "Jan 7", revenue: 180 },
        { label: "Jan 8", revenue: 320 },
        { label: "Jan 9", revenue: 260 },
        { label: "Jan 10", revenue: 240 },
        { label: "Jan 11", revenue: 310 },
        { label: "Jan 12", revenue: 420 },
        { label: "Jan 13", revenue: 520 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading };
};
