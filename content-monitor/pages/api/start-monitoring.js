import { spawn } from 'child_process';

let monitorProcess;

export default function handler(req, res) {
    if (req.method === 'POST') {
        const { url } = req.body;

        if (monitorProcess) {
            monitorProcess.kill();
        }

        monitorProcess = spawn('node', ['monitor.js', url]);

        monitorProcess.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        monitorProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        monitorProcess.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });

        res.status(200).json({ success: true });
    } else {
        res.status(405).end(); // Method Not Allowed
    }
}
