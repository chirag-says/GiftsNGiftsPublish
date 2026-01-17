import { useMemo } from "react";

export const useOrderAnalytics = (orders = []) => {
  return useMemo(() => {
    const dailyMap = {};

    orders.forEach(order => {
      const day = new Date(order.placedAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });
      dailyMap[day] = (dailyMap[day] || 0) + 1;
    });

    const labels = Object.keys(dailyMap).slice(-3);

    const chartData = labels.map((label, index) => ({
      label,
      orders: dailyMap[label],
      color: ["#6366F1", "#22C55E", "#8B5CF6"][index],
    }));

    const delivered = orders.filter(o => o.status === "Delivered").length;
    const completion = orders.length
      ? Math.round((delivered / orders.length) * 100)
      : 0;

    return { chartData, completion };
  }, [orders]);
};
