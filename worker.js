import { parentPort, threadId } from "worker_threads";
import mysql from "mysql2/promise";

parentPort.on("message", async (message) => {
  const connectionConfig = {
    host: "localhost",
    user: "root",
    password: "",
    database: "animeflv",
  };

  const query = `
    INSERT INTO anime 
    (year, rate_start, title, followers, genders, type, image, description, episodes, votes, status, url_anime) 
    VALUES ?`; 

  try {

    const connection = await mysql.createConnection(connectionConfig);

    const values = message.map(item => [
      item.year,
      item.rate_start,
      item.title,
      item.followers,
      item.genders,
      item.type,
      item.image,
      item.description,
      item.episodes,
      item.votes,
      item.status,
      item.url_anime
    ]);


    await connection.query(query, [values]);

    console.log(`Worker - PID: ${process.pid}, Thread ID: ${threadId}`);
    parentPort.postMessage(`Processado: ${message}`);

    await connection.end();

  } catch (error) {
    console.error(
      `Erro no Worker - PID: ${process.pid}, Thread ID: ${threadId}:`,
      error
    );
    parentPort.postMessage(`Erro: ${error.message}`);
  }
});
