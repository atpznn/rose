import * as net from 'net';
interface Plc {
    id: number
}
function plcServer() {
    let server: net.Server | null = null;
    let client: net.Socket | null = null;
    function getStatusT(status: string, qty?: string): string {
        console.log("Received Status Code:", status);
        switch (status) {
            case '01': return 'T01'; // ได้รับคำสั่งแล้ว
            case '02': return 'T02'; // จ่ายยำสำเร็จ ครบตามจำนวน
            case '03': return `T03 - ยำที่จัดได้ Q${qty}`; // จ่ายยำสำเร็จ แต่ไม่ครบตามจำนวน
            case '80': return 'ผิดพลำด เนื่องจากตัวควบคุมหลักไม่พร้อมใช้งาน';
            case '81': return 'ผิดพลำด เนื่องจากตัวควบคุมกลไกไม่พร้อมใช้งาน';
            case '82': return 'ผิดพลำด เนื่องจากสถานะตู้ไม่พร้อมใช้งาน';
            case '83': return 'ผิดพลำด เนื่องจากพารามิเตอร์ไม่สอดคล้องกับฮาร์ดแวร์';
            case '90': return 'การทำงานของตัวควบคุมหลักล้มเหลว';
            case '91': return 'การทำงานของตัวควบคุมกลไกล้มเหลว';
            case '92': return 'สถานะของตู้ล้มเหลว';
            default: return 'T00'; // ค่าเริ่มต้นหากไม่ตรงกับเงื่อนไขใด ๆ
        }
    }
    let plcs: Plc[] = []
    function getNumberOfPlc() {
        return plcs
    }
    function startPlcServer({ port }: { port: number }) {
        server = net.createServer((socket) => {
            client = socket;
            console.log('📡 PLC Connected:', socket.remoteAddress, socket.remotePort);
            plcs.push({
                id: socket.remotePort!
            });


            socket.on('close', () => {
                console.log('❌ PLC Socket Closed');
                const index = plcs.findIndex(x => x.id == socket.remotePort)
                plcs.slice(index, 1)
            });

            socket.on('error', (err) => {
                console.log('⚠️ Socket Error:', err.message);
            });
        });

        server.listen(port, () => {
            console.log(`🚀 PLC Server started on port : ${port}`);
        });

        server.on('error', (err) => {
            console.log('⚠️ Server Error:', err.message);
        });

        server.on('close', () => {
            console.log('🛑 Server Closed');
        });
    }


    function sendToPLC(data: string) {
        if (!client) {
            console.log('⚠️ No PLC Connected');
            return;
        }
        console.log('📤 Sending to PLC:', data);
        client.write(data);
    }

    return {
        startPlcServer,
        sendToPLC,
        getNumberOfPlc
    };
}

export type PlcServer = ReturnType<typeof plcServer>;
export { plcServer };
