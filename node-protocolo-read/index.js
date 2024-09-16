import { createReadStream } from "fs";
import { Worker } from "worker_threads";

const stream = createReadStream("./prot.csv", { encoding: 'utf-8' });

let buffer = "";
let slices = [];
const limit = 3000;


function processChunk(slices) {
    const worker = new Worker("./worker.js", {
      workerData: JSON.stringify(slices),
    });
  
    worker.on("message", () => {
      console.log(`Worker PID: ${process.pid}`);
      console.log(`Worker Thread ID: ${worker.threadId}`);
      console.log("Concluído!");
    });
  
    worker.on("error", (err) => {
      console.error(`Worker error on chunk:`, err);
    });
  
    worker.on("exit", (code) => {
      if (code !== 0) {
        console.error(`Worker stopped with exit code ${code}`);
      }
    });
  }
  

stream.on("data", (chunk) => {
  buffer += chunk;

  const lines = buffer.split('µ\r\n');

  buffer = lines.pop();

  lines.forEach((line) => {
    const columns = line.split('¤'); 
    slices.push(columns);
  });


  if (slices.length >= limit) {
    processChunk(slices);
    slices = []; 
  }
});

stream.on("end", () => {

  if (buffer.length > 0) {
    const columns = buffer.split('¤');
    slices.push(columns);
  }

  if (slices.length > 0) {
    processChunk(slices); 
  }

  console.log("Fim do arquivo.");
});

