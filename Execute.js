import { Worker } from "worker_threads";
import { readFile } from "node:fs/promises";

export class Execute {
  constructor(worker) {
    this.worker = worker;
    this.readFile();
  }
  
  worker;
  messages;
  totalProcess;
  step = 0;

  _runWorker(message) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(new URL("./worker.js", import.meta.url), {
        type: "module",
      });

      worker.postMessage(message);

      worker.on("message", (result) => {

        // progress 
        this.step += 1;
        const percent = `${Math.floor((100 * this.step) / this.totalProcess)} %`;
        console.log(percent);

        return resolve(result);
      });
      
      worker.on("error", reject);
      worker.on("exit", (code) => {
        if (code !== 0) {
          reject(new Error(`Worker finalizado com código: ${code}`));
        }
      });
    });
  }

  async run() {
    const promises = this.messages.map((message) => this._runWorker(message));

    await Promise.all(promises);
  }

  async readFile() {

    const data = await readFile("animeflv.json", "utf8");
    const JsonData = JSON.parse(data);
    const keys = Object.keys(JsonData);

    const mapFile = keys.map(k => {
        return { [k]: JsonData[k] };
    });

   this.messages = mapFile;

   this.totalProcess = mapFile.length;

  }
}
