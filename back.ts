// import express from 'express';
// import net from 'net';
// import cors from 'cors';

// const app = express();

// // ใช้ CORS middleware
// app.use(cors());

// app.use(express.json()); // To handle JSON requests

// let body = {
//     floor: 1,
//     position: 12,
//     qty: 3
// };

// function getStatusT(status: string, qty?: string): string {
//     console.log(status);
//     switch (status) {
//         case '01':
//             console.log("ได้รับคำสั่งแล้ว");
//             return 'T01'; 
//         case '02':
//             console.log("จ่ายยำสำเร็จ ครบตามจำนวน");
//             return 'T02'; // จ่ายยำสำเร็จ ครบตามจำนวน
//         case '03':
//             console.log("จ่ายยำสำเร็จ แต่ไม่ครบตามจำนวน");
//             return `T03 - ยำที่จัดได้ Q${qty}`; // จ่ายยำสำเร็จ แต่ไม่ครบตามจำนวน (แสดงยำที่จัดได้ใน Qxxxx)
//         case '80':
//             return 'ผิดพลำด เนื่องจากตัวควบคุมหลักไม่พร้อมใช้งาน'; // 80
//         case '81':
//             return 'ผิดพลำด เนื่องจากตัวควบคุมกลไกไม่พร้อมใช้งาน'; // 81
//         case '82':
//             return 'ผิดพลำด เนื่องจากสถานะตู้ไม่พร้อมใช้งาน'; // 82
//         case '83':
//             return 'ผิดพลำด เนื่องจากพารามิเตอร์ไม่สอดคล้องกับฮาร์ดแวร์'; // 83
//         case '90':
//             return 'การทำงานของตัวควบคุมหลักล้มเหลว'; // 90
//         case '91':
//             return 'การทำงานของตัวควบคุมกลไกล้มเหลว'; // 91
//         case '92':
//             return 'สถานะของตู้ล้มเหลว'; // 92
//         default:
//             return 'T00'; // ค่าเริ่มต้น (หากไม่พบสถานะที่ตรงกัน)
//     }
// }

// // ตัวแปรสำหรับ running
// let running = 1; 
// // ฟังก์ชัน pad สำหรับเติมเลข 0
// function pad(num: number, length: number): string {
//     return String(num).padStart(length, '0');
// }

// // API เพื่อรับข้อมูลจาก React และอัปเดตสถานะ
// app.post('/api/send', (req, res) => {
//     const { floor, position, qty } = req.body;

//     // อัปเดตข้อมูลของ body
//     if (floor !== undefined) body.floor = floor;
//     if (position !== undefined) body.position = position;
//     if (qty !== undefined) body.qty = qty;

//     console.log('Data received from client:', body);

//     // คำนวณค่าผลรวม
//     const sumValue = 1 + 1 + 1 + 4500 + body.floor + body.position + body.qty + running;
//     const sum = pad(sumValue, 2).slice(-2);  // คำนวณ sum ให้เป็น 2 หลัก

//     // ส่งข้อมูลไปยัง TCP server
//     sendToTCPServer(body, sum);

  
//     running = running > 9 ? 1 : running + 1; 
    

//     res.json({ message: 'Data received and sent to PLC', body });
// });

// // ฟังก์ชันที่ส่งข้อมูลไปยัง TCP server
// function sendToTCPServer(body: { floor: any; position: any; qty: any; }, sum: string) {
//     const client = new net.Socket();
//     client.connect(2001, 'localhost', () => {
//         console.log('Connected to PLC server');

//         // เตรียมข้อมูลเพื่อส่งไปยัง PLC
//         const newFloor = pad(body.floor, 2);
//         const newPosition = pad(body.position, 2);
//         const newQty = pad(body.qty, 4);

//         const message = `B01R${newFloor}C${newPosition}Q${newQty}L01M01T00N${running}D4500S${+sum+1}`;

//         console.log('Sending to PLC:', message);
//         client.write(message);
//     });

//     client.on('data', (data) => {
//         const statusPlc = getStatusT(data.toString().split("T",2)[1].substring(0,2), body.qty.toString());
//         console.log('📥 Received from PLC:', data.toString());
//         console.log('Status:', statusPlc);
//     });

//     client.on('close', () => {
//         console.log('Connection to PLC closed');
//     });
// }

// // สร้าง TCP server
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

// const port = 3000;
// app.listen(port, () => {
//     console.log(`🚀 API server running on http://localhost:${port}`);
// });
