import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const principal = 1000; // เงินต้นเริ่มต้น
const initialData = [
  { date: "2024-01-01", principal: principal, total: principal },
  { date: "2024-02-01", principal: principal * 1, total: principal },
  { date: "2024-03-01", principal: principal * 2, total: principal },
  { date: "2024-04-01", principal: principal * 3, total: principal },
  { date: "2024-05-01", principal: principal * 4, total: principal },
  { date: "2024-06-01", principal: principal * 5, total: principal },
  { date: "2024-07-01", principal: principal * 6, total: principal },
  { date: "2024-08-01", principal: principal * 7, total: principal },
  { date: "2024-09-01", principal: principal * 8, total: principal },
  { date: "2024-10-01", principal: principal * 9, total: principal },
  { date: "2024-11-01", principal: principal * 10, total: principal },
  { date: "2024-12-01", principal: principal * 11, total: principal },

  { date: "2025-01-01", principal: principal * 12, total: principal },
  { date: "2025-02-01", principal: principal * 13, total: principal },
  { date: "2025-03-01", principal: principal * 14, total: principal },
];
const total = initialData.reduce((x, y) => x + y.principal, 0);
const fetchBTCPriceAtDate = async (date: string) => {
  try {
    const timestamp = new Date(date).getTime();
    console.log(date);
    const response = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&startTime=${timestamp}&limit=1`
    );
    const data = await response.json();
    if (data.length > 0) {
      console.log(data);
      return parseFloat(data[0][4]); // ราคาปิด (closing price)
    }
  } catch (error) {
    console.error("Error fetching BTC price:", error);
  }
  return null;
};

const InvestmentGrowthChart = () => {
  const [data, setData] = useState(initialData);

  useEffect(() => {
    const updateData = async () => {
      const updatedData = await Promise.all(
        initialData.map(async (entry, index) => {
          const btcPrice = await fetchBTCPriceAtDate(entry.date);
          return {
            ...entry,
            total: btcPrice
              ? btcPrice // คำนวณจาก BTC ณ วันนั้น ๆ
              : entry.total,
          };
        })
      );
      setData(updatedData);
    };

    updateData();
  }, []);

  return (
    <>
      {total}
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={data}
          margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="principal"
            stroke="#8884d8"
            fillOpacity={1}
            fill="url(#colorPrincipal)"
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#82ca9d"
            fillOpacity={1}
            fill="url(#colorTotal)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </>
  );
};

export default InvestmentGrowthChart;
