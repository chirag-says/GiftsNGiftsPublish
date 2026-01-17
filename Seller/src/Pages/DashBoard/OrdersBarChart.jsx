import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

  const OrdersBarChart = ({ data }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">

    {/* Header */}
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-[18px] font-bold text-gray-800">
        Order Analytics
      </h3>
      <div className="text-right">
        <p className="text-emerald-500 font-bold text-lg">63%</p>
        <p className="text-[10px] text-gray-400 font-semibold uppercase">
          Completion
        </p>
      </div>
    </div>

    {/* Chart */}
    <div className="flex-1">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />

          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94A3B8", fontSize: 11 }}
            dy={10}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94A3B8", fontSize: 11 }}
          />

          <Tooltip />

          <Bar dataKey="orders" radius={[6, 6, 0, 0]} barSize={32}>
            {data.map((item, i) => (
              <Cell key={i} fill={item.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>

  </div>
);


export default OrdersBarChart;
