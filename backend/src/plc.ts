import * as net from 'net';

function plcServer() {
    let client: net.Socket | null = null
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
    function createPlcServer() {
        return new net.Socket()
    }

    function initEvent(client: net.Socket) {
        client.on('data', (data) => {
            const status = data.toString().split("T", 2)[1].substring(0, 2)
            const display = getStatusT(status)
            console.log('📥 Received from PLC:', data.toString());
            console.log('Status:', display);
        });
        client.on('close', () => {
            console.log('Connection to PLC closed');
        });
    }

    function startPlcServer({ port, host }: { port: number, host: string }) {
        return
        // client = createPlcServer()
        // client.connect(port, host, () => {
        //     console.log('Connected to PLC server');
        // });
        // initEvent(client)
    }
    function sendToTCPServer(data: string) {
        if (!client) return
        console.log('Sending to PLC:', data);
        client.write(data);
    }

    return {
        startPlcServer,
        sendToTCPServer
    }
}
export type PlcServer = ReturnType<typeof plcServer>
export { plcServer }
