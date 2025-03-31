const net = require("net");

async function createClient(index, portPlc) {
  const client = net.connect({ host: "127.0.0.1", port: portPlc }, () => {
    console.log(`Connected to PLC (mock) [${index}]`);
    client.write(`Hello PLC [${index}]`);
  });

  client.on("data", (data) => {
    console.log(`Received from PLC [${index}]:`, data.toString());
  });

  client.on("end", () => {
    console.log(`Disconnected from PLC [${index}]`);
  });

  client.on("error", (err) => {
    console.error(`Connection error [${index}]:`, err.message);
  });
  return client;
}
const index = process.argv[2];
createClient(index, 2001);
