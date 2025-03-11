import { expressServer } from './api'
import { plcServer } from './plc'
import { SocketIoServer } from './socket'
const portApi = 3000
const portPlc = 2001
const portSocket = 3001
const plc = plcServer()
plc.startPlcServer({ port: portPlc, host: 'localhost' })
const api = expressServer(plc)
api.startServer(portApi)
const socketIo = SocketIoServer()
socketIo.startSocketIo(portSocket)