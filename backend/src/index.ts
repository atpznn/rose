import { expressServer } from './api'
import { plcServer } from './plc'
import { SocketIoServer } from './socket'
const portApi = 3005
const portPlc = 2001
const portSocket = 3001
function main() {
    // for react 
    const socketIo = SocketIoServer()
    const socket = socketIo.startSocketIo(portSocket)!
    // for plc
    const plc = plcServer(socket)
    plc.startPlcServer({ port: portPlc })

    // for react 
    const api = expressServer(plc)
    api.startServer(portApi)


    // mockPlcConnection(portPlc)
}
main()