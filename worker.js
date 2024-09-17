import { parentPort, workerData } from "worker_threads";
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "animeflv",
  waitForConnections: true,
  connectionLimit: 99,
});

async function getLines({ offSet }) {
  try {
    const connection = await pool.getConnection();
    const query =
      "SELECT * FROM people ORDER BY id LIMIT 1000 OFFSET " + offSet;

    console.log(query);
    
    // Aqui você poderia processar os dados
    connection.release();

    return "Worker finalizado com sucesso";

  } catch (error) {
    console.error(
      `Erro no Worker - PID: ${process.pid}:`,
      error
    );
    throw error; // Lança erro para que o worker avise o processo principal
  }
}

const result = await getLines(workerData);
parentPort.postMessage(result);
