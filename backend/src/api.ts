
import express, { RequestHandler, type Express, type Request, type Response } from 'express';
import cors from 'cors';
import { PlcServer } from './plc';
import { PlcSendMessage } from './interface';

function expressServer(plcServer: PlcServer) {
    let app: Express | null = null;
    let running = 0;

    function createServer(): Express {
        return express();
    }

    function initRoute(app: Express) {
        if (!app) {
            throw new Error('Express app is not initialized');
        }
        app.get('/api/number_plc', (req, res) => {
            res.json({
                allPlc: plcServer.getNumberOfPlc()
            })
        })
        app.post('/api/send', (req, res) => {
            const { floor, position, qty } = req.body;
            const body: PlcSendMessage = {
                floor,
                position,
                qty,
                container: 1
            };

            if (!body.container || !body.floor || !body.qty || !body.position) {
                console.log('❌ payload invalid');
                res.status(400).json({ message: 'ข้อมูลไม่ถูกต้อง' });
            }

            console.log('📥 Data received from client:', body);

            running = running >= 9 ? 1 : running + 1;
            const sumValue = body.container! + body.floor! + body.position! + body.qty! + 1 + 1 + 0 + running + 4500;
            const sum = sumValue.toString().padStart(2, '0').slice(-2);
            const message = `B${String(body.container).padStart(2, '0')}R${String(body.floor).padStart(2, '0')}C${String(body.position).padStart(2, '0')}Q${String(body.qty).padStart(4, '0')}L01M01T00N${running}D4500S${sum}`;
            console.log('📤 Sending...', message);
            // const c = plcServer.sendToPLC(message);

            // if (c) {
            //     c.removeAllListeners('data'); // ✅ ป้องกัน Memory Leak
            //     let responseSent = false;
            //     c.on('data', (data) => {
            //         if (!responseSent) {
            //             res.json({ message: 'Data received and sent to PLC', data: data.toString() });
            //             responseSent = true;
            //         }
            //     });
            // } else {
            //     console.log('❌ PLC Server not available');
            //     res.status(500).json({ message: 'PLC Server ไม่พร้อมใช้งาน' });
            // }
        });
    }

    function startServer(port: number) {
        try {
            app = createServer();
            app.use(express.json());
            app.use(cors());
            initRoute(app);
            app.listen(port, () => {
                console.log(`🚀 API server running on port: ${port}`);
            });
        } catch (ex) {
            console.log('❌ Error starting API server', ex);
        }
    }

    function getServer() {
        return app;
    }

    return {
        getServer,
        startServer
    };
}

export { expressServer };