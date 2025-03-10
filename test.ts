import net from 'net'

let running = 1
const body = {
    floor: 1,
    position: 2,
    qty: 3
    b:1,
}

function getStatusT(status: string): string {
    console.log(status)
    switch (status) {
        case '01':
            console.log("ได้รับคำสั่งแล้ว")
            return 'T01'; // รอจัดยา
        case 'preparing':
            return 'T02'; // กำลังจัดยา
        case 'done':
            return 'T03'; // จัดยาเสร็จ
        default:
            return 'T00'; // ค่าเริ่มต้น
    }
}
const server = net.createServer((socket) => {
    console.log('🔗 Client connected:', socket.remoteAddress, socket.remotePort);

    setInterval(() => {
        const pad = (num: number, length: number) => num.toString().padStart(length, '0');
        const newFloor = pad(body.floor, 2);
        const newPosition = pad(body.position, 2);
        const newQty = pad(body.qty, 4);
        const newMachine= pad(body.b,2)
        running = running > 9 ? 1 : running;
        const sumValue = body.b + body.floor + body.position+body.qty+1+1+0+running + 4500;
        console.log('sum is ',sumValue)
        const sum = pad(sumValue, 2).slice(-2);
        const message = `B${newMachine}R${newFloor}C${newPosition}Q${newQty}L01M01T00N${running}D4500S${sum}`;
        console.log('📤 Sending...', message);
        socket.write(message);
        running++;
    }, 2000);

    socket.on('data', (data) => {
      const status =   data.toString().split("T",2)[1].substring(0,2)
      const display = getStatusT(status)
        console.log('📥 Received from PLC:', data.toString());
        console.log('📥 Received from PLC status :', status);
        console.log('📥 Received from PLC display :',display);

    });

    // จัดการกรณีขาดการเชื่อมต่อ
    socket.on('end', () => {
        console.log('❌ Client disconnected');
    });

    socket.on('error', (err) => {
        console.error('⚠️ Error:', err.message);
    });
});

server.listen(2001, () => {
    console.log('🚀 TCP Server กำลังทำงานที่ 2001');
});
