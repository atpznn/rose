import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface Plc {
  floor: number;
  position: number;
  res: string;
  req: string;
  isOnline: boolean;
}

interface internal extends Plc {
  qty: number;
}

const InvestmentGrowthChart = () => {
  const [plcs, setPlcs] = useState<internal[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState<boolean>(false);

  // ฟังก์ชันเชื่อมต่อกับ Socket.IO
  useEffect(() => {
    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);
    newSocket.on("connect", () => {
      setIsSocketConnected(true); // เชื่อมต่อสำเร็จ
    });

    newSocket.on("disconnect", () => {
      setIsSocketConnected(false); // การเชื่อมต่อถูกตัด
    });

    newSocket.on("plc-connect", ({ plc }: { plc: Plc[] }) => {
      setPlcs(plc.map((x) => ({ ...x, qty: 0 })));
    });
    newSocket.on("plc-disconnect", ({ plc }: { plc: Plc[] }) => {
      setPlcs(plc.map((x) => ({ ...x, qty: 0 })));
    });
    newSocket.on("plc-res", ({ plc }: { plc: Plc[] }) => {
      setPlcs(plc.map((x) => ({ ...x, qty: 0 })));
    });
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // ฟังก์ชันสำหรับดึงข้อมูล PLC
  async function fetchPlc() {
    const numberPlc = await (
      await fetch("http://localhost:3005/api/number_plc")
    ).json();
    setPlcs(numberPlc.allPlc.map((x) => ({ ...x, qty: 0 })));
  }

  // เรียกใช้ fetchPlc เมื่อ component mount
  useEffect(() => {
    fetchPlc();
  }, []);

  // ฟังก์ชันเมื่อกดปุ่ม จะส่ง POST API และข้อมูลผ่าน Socket.IO
  const handleButtonClick = async (plc: internal) => {
    await fetch("http://localhost:3005/api/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        floor: plc.floor,
        position: plc.position,
        qty: plc.qty,
      }),
    });
  };

  // ฟังก์ชันเพิ่ม/ลด qty
  const handleIncrease = (index: number) => {
    const updatedPlcs = [...plcs];
    updatedPlcs[index].qty += 1; // เพิ่มค่า qty
    setPlcs(updatedPlcs); // อัปเดต state
  };

  const handleDecrease = (index: number) => {
    const updatedPlcs = [...plcs];
    if (updatedPlcs[index].qty > 0) {
      updatedPlcs[index].qty -= 1; // ลดค่า qty
    }
    setPlcs(updatedPlcs); // อัปเดต state
  };

  return (
    <>
      <div
        style={{
          backgroundColor: isSocketConnected ? "green" : "red",
          color: "white",
          padding: "8px",
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        {isSocketConnected
          ? "เชื่อมต่อกับ Socket สำเร็จ"
          : "หลุดการเชื่อมต่อจาก Socket"}
      </div>

      <div>จำนวน plc ทั้งหมด: {plcs.length}</div>
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          marginTop: 48,
        }}
      >
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {plcs.map((x, index) => (
            <div
              key={`${x.floor}-${x.position}`} // เพิ่ม key เพื่อไม่ให้เกิดปัญหาการรีเรนเดอร์
              style={{
                border: "2px solid ",
                borderRadius: 8,
                padding: 24,
                borderColor: x.isOnline ? "green" : "red",
              }}
            >
              <div>{x.isOnline ? "ออนไลน์" : "หลุดการเชื่อมต่อ"}</div>
              <div>
                ชั้น {x.floor} ตำแหน่ง {x.position}
              </div>
              <div>คำสั่ง {x.req}</div>
              <div>การตอบกลับ {x.res}</div>

              {/* ปุ่มเพิ่ม/ลด qty */}
              <div>
                <button onClick={() => handleDecrease(index)}>ลด</button>
                {x.qty}
                <button onClick={() => handleIncrease(index)}>เพิ่ม</button>
              </div>

              <button onClick={() => handleButtonClick(x)}>ส่งข้อมูล</button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default InvestmentGrowthChart;
