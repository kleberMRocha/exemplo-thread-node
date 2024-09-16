import { parentPort, workerData } from 'worker_threads';
import mysql from "mysql2/promise";

const connectionConfig = {
    host: "localhost",
    user: "root",
    password: "",
    database: "animeflv",
  };

async function processChunk(chunk) {
    try {

        const connection = await mysql.createConnection(connectionConfig);
        const arrayList = JSON.parse(chunk);
        const values = arrayList.map(item => [
            item.id ,
            item.submitter,
            item.authors ,
            item.title,
            item.comments,
            item.journal_ref,
            item.doi,
            item.categories,
            item.license,
            item.abstract,
            item.update_date,
          ]);
       
        const query = `
        INSERT INTO metadata 
        (
            id, submitter, authors, title, comments, journal_ref, doi, categories, license, abstract, update_date
        )
        VALUES ?`; 

        await connection.query(query, [values]);
        await connection.end();
     
    } catch (err) {
        console.error('Error processing chunk:', err);
        return null;
    }
}


const result = await processChunk(workerData);
parentPort.postMessage(result);
