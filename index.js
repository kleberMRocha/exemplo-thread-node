import { Execute } from './Execute.js';

const exec = new Execute('./worker.js');
await exec.readFile();

exec.run()
.catch(err => console.error(err))
.finally(() =>  process.exit(0));

