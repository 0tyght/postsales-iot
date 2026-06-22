import {copyFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=path.join(root,'apps','technician-web','public');
const target=path.join(root,'apps','admin-web','public');
await mkdir(target,{recursive:true});
await Promise.all(['icon-192.png','icon-512.png'].map(name=>copyFile(path.join(source,name),path.join(target,name))));
