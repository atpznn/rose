import express, { Express } from 'express';
import cors from 'cors';
import { PlcServer } from './plc';
import { PlcSendMessage } from './interface';

function expressServer(plcServer: PlcServer) {
    let app: Express | null = null
    let running = 1;
    function createServer() {
        return express();
    }
    const pad = (num: number, length: number) => num.toString().padStart(length, '0');
    function initRoute(app: Express) {
        app.post('/api/send', (req, res) => {
            const { floor, position, qty } = req.body;
            const body: PlcSendMessage = {
                floor: floor,
                position: position,
                qty: qty,
                container: 1
            }
            if (!body.container || !body.floor || !body.qty || !body.position) {
                console.log('payload invalid')
                return
            }
            console.log('Data received from client:', body);
            running = running > 9 ? 1 : running;
            const sumValue = body.container + body.floor + body.position + body.qty + 1 + 1 + 0 + running + 4500;
            const sum = pad(sumValue, 2).slice(-2);
            const message = `B${pad(body.container, 2)}R${pad(body.floor, 2)}C${pad(body.position, 2)}Q${pad(body.qty, 4)}L01M01T00N${running}D4500S${sum}`;
            console.log('📤 Sending...', message);
            plcServer.sendToTCPServer(message);
            res.json({ message: 'Data received and sent to PLC', body });
        });
    }
    function startServer(port: number) {
        app = createServer()
        app.use(express.json());
        app.use(cors());
        initRoute(app)
        app.listen(port, () => {
            console.log(`🚀 API server running on http://localhost:${port}`);
        });
    }
    function getServer() {
        return app
    }
    return {
        getServer,
        startServer
    }
}
export { expressServer }
