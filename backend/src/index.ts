import { expressServer } from './api'
import { plcServer } from './plc'
import { SocketIoServer } from './socket'
const portApi = 3000
const portPlc = 2001
const portSocket = 3001

// for plc
const plc = plcServer()
plc.startPlcServer({ port: portPlc, host: 'localhost' })

// for react 
const api = expressServer(plc)
api.startServer(portApi)

// for react 
const socketIo = SocketIoServer()
socketIo.startSocketIo(portSocket)