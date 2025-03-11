import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
const QueueList: React.FC = () => {
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    // เชื่อมต่อกับเซิร์ฟเวอร์ที่พอร์ต 3001
    const socket = io("http://localhost:3001");

    // เมื่อรับข้อความจาก server
    socket.on("message", (data) => {
      console.log(data);
    });

    // เมื่อส่งข้อความจาก client
    socket.emit("clientMessage", "Hello from client");
    setSocket(socket);
    // Cleanup เมื่อ component ถูกลบ
    return () => {
      socket.disconnect();
    };
  }, []);

  const sendCommand = (floor: number, position: number) => {
    if (!socket || !isConnected) {
      console.error("⚠️ WebSocket not connected!");
      return;
    }

    const key = `${floor}-${position}`;
    const qty = quantities[key] || 1;

    const command = { floor, position, qty, status: "preparing" }; // กำหนดสถานะเป็น 'preparing'
    console.log("📤 Sending Command:", command);

    // ส่งคำสั่งไปยัง WebSocket server
    socket.send(JSON.stringify(command));
  };

  const handleQuantityChange = (
    floor: number,
    position: number,
    delta: number
  ) => {
    const key = `${floor}-${position}`;
    setQuantities((prev) => {
      const currentQty = prev[key] !== undefined ? prev[key] : 0;
      return {
        ...prev,
        [key]: Math.max(currentQty + delta, 0),
      };
    });
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {[...Array(7)].map((_, i) => {
        const floorIndex = 7 - i;
        return (
          <div key={floorIndex} className="space-y-2">
            <h2 className="text-xl font-semibold"> ชั้นที่ {floorIndex} </h2>
            <div className="grid grid-cols-12 gap-2">
              {[...Array(12)].map((_, positionIndex) => {
                const key = `${floorIndex}-${positionIndex + 1}`;
                return (
                  <div
                    key={positionIndex}
                    className={`p-3 border rounded-lg shadow-md flex flex-col items-center space-y-2 cursor-pointer ${
                      selectedFloor === floorIndex &&
                      selectedPosition === positionIndex + 1
                        ? "bg-blue-100 "
                        : "bg-white"
                    }`}
                    onClick={() => {
                      setSelectedFloor(floorIndex);
                      setSelectedPosition(positionIndex + 1);
                    }}
                  >
                    <p>ช่องที่ {positionIndex + 1} </p>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuantityChange(
                            floorIndex,
                            positionIndex + 1,
                            -1
                          );
                        }}
                        className="bg-red-500 text-white px-2 rounded"
                        disabled={(quantities[key] || 0) <= 0}
                      >
                        -
                      </button>
                      <span> {quantities[key] || 0} </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuantityChange(
                            floorIndex,
                            positionIndex + 1,
                            1
                          );
                        }}
                        className="bg-green-500 text-white px-2 rounded"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        sendCommand(floorIndex, positionIndex + 1); // ส่งคำสั่งไปที่ WebSocket เมื่อกด "จัด"
                      }}
                      className="bg-blue-500 text-white px-4 py-1 rounded disabled:opacity-50"
                      disabled={!isConnected}
                    >
                      จัด
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      {statusMessage && (
        <p className="text-lg font-semibold"> {statusMessage} </p>
      )}
    </div>
  );
};

export default QueueList;
