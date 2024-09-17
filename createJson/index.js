import { Worker } from 'worker_threads';

let lastId = 0; // Começa com 0 ou o menor ID no banco
let allDataRead = false;

async function processData() {
    while (!allDataRead) {
        await new Promise((resolve, reject) => {
            const worker = new Worker('./worker.js', {
                workerData: { lastId },
            });

            worker.on('message', (data) => {
                console.log(`Worker PID: ${process.pid}`);
                console.log(`Worker Thread ID: ${worker.threadId}`);

                if (data === 0 || data === null) {
                    allDataRead = true;
                } else {
                    lastId += 20000;
                }

                resolve();
            });

            worker.on('error', (err) => {
                console.error('Erro no worker:', err);
                reject(err);
            });

            worker.on('exit', (code) => {
                if (code !== 0) {
                    console.error(`Worker parado com código de saída ${code}`);
                    reject(new Error(`Worker stopped with exit code ${code}`));
                }
            });
        });
    }

    console.log('Todos os dados foram processados!');
}

await processData();
