import * as WebSocket from 'ws';
import * as readline from 'readline';
import * as https from 'https';
import * as fs from 'fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

interface CommandArgs {
    host: string;
    port: number;
    key: string;
    cert: string;
}

const argv = yargs(hideBin(process.argv))
    .options({
        host: { type: 'string', default: 'localhost' },
        port: { type: 'number', default: 1459 },
        key: { type: 'string', default: 'test_key.pem' },
        cert: { type: 'string', default: 'test_cert.pem' },
    })
    .parseSync() as CommandArgs;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

async function setupWebSocketServer({ host, port, key, cert }: CommandArgs): Promise<void> {
    const server = https.createServer({
        cert: fs.readFileSync(cert),
        key: fs.readFileSync(key),
    });

    const wss = new WebSocket.Server({ server });

    wss.on('connection', function connection(ws) {
        console.log('----------------------------------------');
        console.log(`Client connected`);
        console.log('----------------------------------------');

        ws.on('message', function message(data) {
            console.log(`${data}`);
        });

        ws.on('close', function close() {
            console.log('Client disconnected');
        });

        rl.on('line', (input) => {
            const commandToSend = input.trim() + '\n'; 
            ws.send(commandToSend);
            if (input.trim().toLowerCase() === 'exit') {
                rl.close();
                ws.close();
            }
        });
    });

    server.listen(port, host, () => {
        console.log(`Server is running on https://${host}:${port}`);
    });
}

setupWebSocketServer(argv).catch((err) => {
    console.error(err);
    process.exit(1);
});
