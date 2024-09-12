import { parentPort, threadId } from 'worker_threads';
import { mkdir, access, writeFile } from 'node:fs/promises';

const CONCURRENCY_LIMIT = 300; 

async function limitConcurrency(tasks, limit) {
    const results = [];
    const executing = [];
    for (const task of tasks) {
        const p = Promise.resolve().then(() => task());
        results.push(p);
        if (limit <= tasks.length) {
            const e = p.finally(() => {
                executing.splice(executing.indexOf(e), 1);
            });
            executing.push(e);
            if (executing.length >= limit) {
                await Promise.race(executing);
            }
        }
    }
    return Promise.all(results);
}

parentPort.on('message', async (message) => {
    try {
        const key = Object.keys(message)[0];
        const ids = Object.keys(message[key]);
        const dirPath = './' + key;

        const directoryExists = await access(dirPath).then(() => true).catch(() => false);
        if (!directoryExists) {
            await mkdir(dirPath, { recursive: true });
        }

        await limitConcurrency(ids.map((registro) => async () => {
            await writeFile(`${dirPath}/${registro}.txt`, JSON.stringify(message[key][registro]));
        }), CONCURRENCY_LIMIT);

        console.log(`Worker - PID: ${process.pid}, Thread ID: ${threadId}`);
        parentPort.postMessage(`Processado: ${message}`);

    } catch (error) {

        console.error(`Erro no Worker - PID: ${process.pid}, Thread ID: ${threadId}:`, error);
        parentPort.postMessage(`Erro: ${error.message}`);
    }
});
