const net = require("net");
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function parseMessage(message) {
  // ใช้ regular expression ในการจับค่า floor และ position
  const regex = /B(\d{2})R(\d{2})C(\d{2})Q(\d{4})L01M01T00N(\d+)D4500S(\d{2})/;
  const match = message.match(regex);

  if (match) {
    // match[1] จะเป็น floor, match[2] จะเป็น position
    const floor = parseInt(match[2]);
    const position = parseInt(match[3]);

    console.log(`Floor: ${floor}, Position: ${position}`);
    return { floor, position };
  } else {
    console.error("Message format is incorrect.");
    return null;
  }
}
async function createClient(floor, position, portPlc) {
  const client = net.connect({ host: "127.0.0.1", port: portPlc }, () => {
    console.log(
      `Connected to PLC (mock) [floor:${floor} position:${position}]`
    );
    client.write(
      JSON.stringify({
        type: "Greeting",
        data: {
          floor: floor,
          position: position,
        },
      })
    );
  });

  client.on("data", (data) => {
    console.log(
      `Received from PLC [floor:${floor} position:${position}]:`,
      data.toString()
    );
  });

  client.on("data", async (_data) => {
    const data = _data.toString();
    console.log("receive", data);
    const { floor, position } = parseMessage(data);
    await delay(5000); // รอ 5 วิ
    client.write(
      JSON.stringify({
        type: "Res",
        data: {
          floor: floor,
          position: position,
          res: "success",
        },
      })
    );
  });
  client.on("end", () => {
    console.log(`Disconnected from PLC [floor:${floor} position:${position}]`);
  });

  client.on("error", (err) => {
    console.error(
      `Connection error [floor:${floor} position:${position}]:`,
      err.message
    );
  });
  return client;
}
const floor = process.argv[2];
const position = process.argv[3];

createClient(floor, position, 2001);
