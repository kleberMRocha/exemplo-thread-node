import { createReadStream } from "fs";
import { Worker } from "worker_threads";

const stream = createReadStream("./metadata.json");

let buffer = "";
let slice = [];
const limit = 10000;

stream.on("data", (chunk) => {
  buffer += chunk.toString("utf-8");

  let boundary = buffer.indexOf("}\n{");

  while (boundary !== -1) {
 
    const jsonObjectString = buffer.slice(0, boundary + 1);
    try {
      const jsonObject = JSON.parse(jsonObjectString);
      slice.push(jsonObject);

      if (slice.length === limit) {
        const worker = new Worker("./worker.js", {
          workerData: JSON.stringify(slice),
        });

        worker.on("message", (result) => {
          console.log(`Worker PID: ${process.pid}`);
          console.log(`Worker Thread ID: ${worker.threadId}`);

          console.log(`Concluido !`);
        });

        worker.on("error", (err) => {
          console.error(`Worker error on chunk:`, err);
        });

        worker.on("exit", (code) => {
          if (code !== 0) {
            console.error(`Worker stopped with exit code ${code}`);
          }
          slice = [];
        });
      }
    } catch (err) {
      console.error("Erro ao processar JSON:", err);
    }

    buffer = buffer.slice(boundary + 2);
    boundary = buffer.indexOf("}\n{");
  }
});

stream.on("end", () => {
  if (buffer.length > 0) {
    try {
      const jsonObject = JSON.parse(buffer);
      slice.push(jsonObject);
    } catch (err) {
      console.error("Erro ao processar o último objeto JSON:", err);
    }
  }

  if (slice.length > 0) {
    const worker = new Worker("./worker.js", {
      workerData: JSON.stringify(slice),
    });

    worker.on("message", () => {
      console.log(` ---- Fim ----`);
    });

    worker.on("error", (err) => {
      console.error(`Worker error on final slice:`, err);
    });

    worker.on("exit", (code) => {
      if (code !== 0) {
        console.error(`Worker stopped with exit code ${code}`);
      }
    });
  }

  console.log("Fim do arquivo.");
});
