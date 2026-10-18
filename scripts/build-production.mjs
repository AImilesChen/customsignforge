import {spawnSync} from 'node:child_process';
import {existsSync,readFileSync,readdirSync} from 'node:fs';
import path from 'node:path';
const result=spawnSync(process.execPath,['scripts/run.mjs','astro','build'],{stdio:'inherit',env:{...process.env,CSF_DEPLOY:'production',CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV:'false'}});
if(result.status!==0)process.exit(result.status||1);
const root='dist-production';
const secretsFile='.runtime/deployment/secrets.json';
const secretValues=existsSync(secretsFile)?Object.values(JSON.parse(readFileSync(secretsFile,'utf8'))).filter(v=>typeof v==='string'&&v.length>10):[];
if(existsSync('.dev.vars'))for(const line of readFileSync('.dev.vars','utf8').split(/\r?\n/)){const split=line.indexOf('=');if(['SESSION_SECRET','LOCAL_ADMIN_PASSWORD','ADMIN_EMAILS'].includes(line.slice(0,split))&&line.slice(split+1).length>10)secretValues.push(line.slice(split+1));}
function inspect(dir){for(const entry of readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory()){inspect(file);continue;}if(/^\.dev\.vars(?:\.|$)|^\.env(?:\.|$)/.test(entry.name))throw Error('Production output includes a local environment file: '+file);const bytes=readFileSync(file);for(const secret of secretValues)if(bytes.includes(Buffer.from(secret)))throw Error('Production output contains a private deployment value: '+file);}}
inspect(root);
const config=JSON.parse(readFileSync(root+'/server/wrangler.json','utf8'));
if(config.vars?.APP_ENV!=='production'||config.vars?.LOCAL_ADMIN_ENABLED!=='false')throw Error('Unsafe production environment');
if(!config.d1_databases?.some(d=>d.binding==='DB'&&d.database_name==='customsignforge-production'))throw Error('Production database missing');
console.log('PASS production output: production bindings, local login disabled, no environment files or private deployment values.');
