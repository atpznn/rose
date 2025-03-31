import { useEffect, useState } from "react";
interface Plc {
  id: number;
}
const InvestmentGrowthChart = () => {
  const [plcs, setPlcs] = useState<Plc[]>([]);
  async function fetchPlc() {
    const numberPlc = await (
      await fetch("http://localhost:3005/api/number_plc")
    ).json();
    setPlcs(numberPlc.allPlc);
  }
  useEffect(() => {
    fetchPlc();
  }, []);

  return (
    <>
      <div>
        จำนวน plc ทั้งหมด
        {plcs.length}
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {plcs.map((x) => (
          <div
            style={{
              border: "1px solid ",
              borderRadius: 8,
              padding: 24,
              borderColor: "white",
            }}
          >
            {x.id}
            <div></div>
            <div></div>
            <div></div>
          </div>
        ))}
      </div>
    </>
  );
};

export default InvestmentGrowthChart;
