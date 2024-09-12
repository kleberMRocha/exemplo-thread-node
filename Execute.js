import { Worker } from "worker_threads";
import { readFile } from "node:fs/promises";

export class Execute {
  constructor() {
    this.readFile();
  }
  
  worker;
  messages;
  totalProcess;

  _runWorker(message) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(new URL("./worker.js", import.meta.url), {
        type: "module",
      });

      worker.postMessage(message);

      worker.on("message", (result) => {

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

    let current = 0;
    const slices = [];

    const keys = Object.keys(this.messages);

    keys.forEach(k => {
      current++;

      if(!slices.length){
        slices.push([this.messages[k]]);
        return;
      }

      if(current > 1200){

        current = 0;
        slices.push([this.messages[k]]);
        return;
      }


      slices[slices.length -1].push(this.messages[k]);


    });

    const promises = slices.map((message) => {
     return this._runWorker(message);
    });

    await Promise.all(promises);
  }

  async readFile() {
    const concatMessages = {};
    
    const data = await readFile("animeflv.json", "utf8");
    const JsonData = JSON.parse(data);

    const keys = Object.keys(JsonData);
    const ids = Object.keys(JsonData["title"]);

    ids.forEach((id) => {
      const obj = keys.reduce(function (acc, item) {
        acc[item] = "";

        return acc;
      }, {});

      concatMessages[id] = obj;

      keys.forEach(k => {
        concatMessages[id][k] = JsonData[k][id]
      });


    });

    this.messages = concatMessages;

    this.totalProcess = ids.length;
  }
}
