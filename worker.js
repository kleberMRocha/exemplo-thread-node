import { parentPort, threadId } from "worker_threads";
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "animeflv",
  waitForConnections: true,
  connectionLimit: 99, // Ajuste conforme necessário
});

parentPort.on("message", async (message) => {
  const query = `
    INSERT INTO anime 
    (year, rate_start, title, followers, genders, type, image, description, episodes, votes, status, url_anime) 
    VALUES ?`;

  try {
    const connection = await pool.getConnection();

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
    connection.release(); // Libere a conexão após o uso

    console.log(`Worker - PID: ${process.pid}, Thread ID: ${threadId}`);
    parentPort.postMessage(`Processado: ${message}`);

  } catch (error) {
    console.error(
      `Erro no Worker - PID: ${process.pid}, Thread ID: ${threadId}:`,
      error
    );
    parentPort.postMessage(`Erro: ${error.message}`);
  }
});
