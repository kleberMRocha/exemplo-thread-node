import { parentPort, workerData } from "worker_threads";
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

    const query = `
        INSERT INTO documentos 
        (   tx_tp_documento, 
            nr_aa_documento, 
            nr_documento, 
            tx_cd_unidade_criadora, 
            tx_cd_unidade_destino, 
            dt_lancamento, 
            dt_envio, 
            dt_recebimento, 
            tx_cd_unidade_remetente, 
            nr_aa_guia, 
            nr_guia, 
            tx_ds_comentario, 
            nr_cd_usuario, 
            nr_cd_usuario_rec, 
            id_seq_andamento, 
            nr_ocorrencia, 
            nr_aa_ocorrencia, 
            nr_cd_usuario_guia
        )
        VALUES ?`;

    await connection.query(query, [JSON.parse(chunk)]);
    await connection.end();

  } catch (err) {
    console.error("Error processing chunk:", err);
    return null;
  }
}

const result = await processChunk(workerData);
parentPort.postMessage(result);
