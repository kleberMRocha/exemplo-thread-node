import { parentPort, workerData } from 'worker_threads';
import mysql from 'mysql2/promise';
import { createWriteStream } from 'fs';
import path from 'path';

const connectionConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'animeflv'
};

async function processChunk(lastId) {
    try {
        const connection = await mysql.createConnection(connectionConfig);

        const sql = `SELECT * FROM metadata WHERE id > ? ORDER BY id LIMIT 20000`;
        const [rows] = await connection.query(sql, [lastId]);

        await connection.end();

        const filePath = path.join('./data.json');
        const writeStream = createWriteStream(filePath, { flags: 'a', encoding: 'utf8' });

        if (lastId === 0) {
            writeStream.write('[');
        }

        rows.forEach((row, index) => {
            const rowJSON = JSON.stringify(row);
            if (index > 0 || lastId > 0) {
                writeStream.write(',\n');
            }
            writeStream.write(rowJSON);
        });

        if (rows.length < 20000) {
            writeStream.write(']');
        }

        writeStream.end();
        return rows.length;

    } catch (err) {
        console.error('Erro ao processar o chunk:', err);
        return null;
    }
}

const result = await processChunk(workerData.lastId);
parentPort.postMessage(result);
