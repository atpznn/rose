import express from 'express';
import net from 'net';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json()); // To handle JSON requests
function getStatusT(status: string, qty?: string): string {
    console.log(status);
    switch (status) {
        case '01':
            console.log("ได้รับคำสั่งแล้ว");
            return 'T01';
        case '02':
            console.log("จ่ายยำสำเร็จ ครบตามจำนวน");
            return 'T02'; // จ่ายยำสำเร็จ ครบตามจำนวน
        case '03':
            console.log("จ่ายยำสำเร็จ แต่ไม่ครบตามจำนวน");
            return `T03 - ยำที่จัดได้ Q${qty}`; // จ่ายยำสำเร็จ แต่ไม่ครบตามจำนวน (แสดงยำที่จัดได้ใน Qxxxx)
        case '80':
            return 'ผิดพลำด เนื่องจากตัวควบคุมหลักไม่พร้อมใช้งาน'; // 80
        case '81':
            return 'ผิดพลำด เนื่องจากตัวควบคุมกลไกไม่พร้อมใช้งาน'; // 81
        case '82':
            return 'ผิดพลำด เนื่องจากสถานะตู้ไม่พร้อมใช้งาน'; // 82
        case '83':
            return 'ผิดพลำด เนื่องจากพารามิเตอร์ไม่สอดคล้องกับฮาร์ดแวร์'; // 83
        case '90':
            return 'การทำงานของตัวควบคุมหลักล้มเหลว'; // 90
        case '91':
            return 'การทำงานของตัวควบคุมกลไกล้มเหลว'; // 91
        case '92':
            return 'สถานะของตู้ล้มเหลว'; // 92
        default:
            return 'T00'; // ค่าเริ่มต้น (หากไม่พบสถานะที่ตรงกัน)
    }
}
let running = 1;
app.post('/api/send', (req, res) => {
    const { floor, position, qty } = req.body;
    const body = {
        floor: null,
        position: null,
        qty: null,
        container: 1
    }
    if (floor !== undefined) body.floor = floor;
    if (position !== undefined) body.position = position;
    if (qty !== undefined) body.qty = qty;
    console.log('Data received from client:', body);
    const pad = (num: number, length: number) => num.toString().padStart(length, '0');
    const newFloor = pad(body.floor, 2);
    const newPosition = pad(body.position, 2);
    const newQty = pad(body.qty, 4);
    const newContaniner = pad(body.container, 2)
    running = running > 9 ? 1 : running;
    const sumValue = body.container + body.floor + body.position + body.qty + 1 + 1 + 0 + running + 4500;
    const sum = pad(sumValue, 2).slice(-2);
    const message = `B${newContaniner}R${newFloor}C${newPosition}Q${newQty}L01M01T00N${running}D4500S${sum}`;
    console.log('📤 Sending...', message);
    sendToTCPServer(message);
    running = running > 9 ? 1 : running + 1;
    res.json({ message: 'Data received and sent to PLC', body });
});

// plc 
const client = new net.Socket();
client.connect(2001, 'localhost', () => {
    console.log('Connected to PLC server');
});
client.on('data', (data) => {
    const status = data.toString().split("T", 2)[1].substring(0, 2)
    const display = getStatusT(status)
    console.log('📥 Received from PLC:', data.toString());
    console.log('Status:', display);
});
client.on('close', () => {
    console.log('Connection to PLC closed');
});

function sendToTCPServer(data: string) {
    console.log('Sending to PLC:', data);
    client.write(data);
}

// // socket 
// const server = net.createServer((socket) => {
//     console.log('🔗 Client connected:', socket.remoteAddress, socket.remotePort);

//     socket.on('data', (data) => {
//         console.log('📥 Received from PLC:', data.toString());
//     });

//     socket.on('end', () => {
//         console.log('❌ Client disconnected');
//     });

//     socket.on('error', (err) => {
//         console.error('⚠️ Error:', err.message);
//     });
// });

// server.listen(2001, () => {
//     console.log('🚀 TCP Server กำลังทำงานที่ 2001');
// });

const port = 3000;
app.listen(port, () => {
    console.log(`🚀 API server running on http://localhost:${port}`);
});
