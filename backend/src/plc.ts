import * as net from 'net';
import { Server, Socket } from 'socket.io';
interface Plc extends PlcPayload {
    instance: net.Socket | null
}
interface PlcResponse extends PlcPayload {
    isOnline: boolean,

}
interface PlcPayload {
    floor: number
    position: number
    req: string,
    res: string
}
const instancesDefault: Plc[] = [{
    floor: 1,
    position: 1,
    instance: null,
    req: '', res: ''
},
{
    floor: 1,
    position: 2,
    instance: null,
    req: '', res: ''
},
{
    floor: 1,
    position: 3,
    instance: null,
    req: '', res: ''
}, {
    floor: 2,
    position: 1,
    instance: null,
    req: '', res: ''
}, {
    floor: 2,
    position: 2,
    instance: null,
    req: '', res: ''
}]
const typeReq = {
    Greeting: 'Greeting',
    Res: 'Res'
}
function plcServer(socketIo: Server) {
    let server: net.Server | null = null;
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

    function getNumberOfPlc() {
        return instancesDefault
    }
    function startPlcServer({ port }: { port: number }) {
        server = net.createServer((socket) => {
            console.log('📡 PLC Connected:', socket.remoteAddress, socket.remotePort);
            socket.on('data', (data) => {
                const __data = JSON.parse(data.toString()) as { type: string, data: unknown }
                if (__data.type == typeReq.Greeting) {
                    const _data = __data.data as { floor: number, position: number }
                    const index = instancesDefault.findIndex(x => x.floor == _data.floor && x.position == _data.position)
                    if (index < 0) {
                        instancesDefault.push({
                            position: _data.position,
                            floor: _data.floor,
                            req: '', res: '',
                            instance: socket
                        });
                    }
                    else {
                        instancesDefault[index].instance = socket
                    }
                    socketIo.emit('plc-connect', { plc: instancesDefault.map<PlcPayload>(x => ({ floor: x.floor, position: x.position, isOnline: !!x.instance, req: '', res: '' })) })

                }
                else if (__data.type == typeReq.Res) {
                    const _data = __data.data as { floor: number, position: number, res: string }
                    const index = instancesDefault.findIndex(x => x.floor == _data.floor && x.position == _data.position)
                    if (index >= 0) {
                        instancesDefault[index].res = _data.res
                        socketIo.emit('plc-res', { plc: instancesDefault.map<PlcPayload>(x => ({ floor: x.floor, position: x.position, isOnline: !!x.instance, req: x.req, res: x.res })) })

                    }
                }
            })
            socket.on('close', () => {
                console.log('❌ PLC Socket Closed');
                const index = instancesDefault.findIndex(x => x.instance?.remotePort == socket.remotePort)
                instancesDefault[index].instance = null
                socketIo.emit('plc-disconnect', { plc: instancesDefault.map<PlcPayload>(x => ({ floor: x.floor, position: x.position, isOnline: !!x.instance, req: '', res: '' })) })
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


    function sendToPLC(floor: number, position: number, data: string) {
        const client = instancesDefault.find(x => x.floor == floor && x.position == position)
        if (!client) {
            console.log('⚠️ No PLC Connected');
            return;
        }
        console.log('📤 Sending to PLC:', data);
        client.instance?.write(data);
        client.req = data
        socketIo.emit('plc-res', { plc: instancesDefault.map<PlcPayload>(x => ({ floor: x.floor, position: x.position, isOnline: !!x.instance, req: x.req, res: 'รอสักครู่' })) })
    }

    return {
        startPlcServer,
        sendToPLC,
        getNumberOfPlc
    };
}

export type PlcServer = ReturnType<typeof plcServer>;
export { plcServer };
