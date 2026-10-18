import { randomBytes } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
const target=new URL('../.dev.vars',import.meta.url);
try {
 await writeFile(target,`SESSION_SECRET=${randomBytes(48).toString('hex')}\nLOCAL_ADMIN_PASSWORD=${randomBytes(24).toString('hex')}\n`,{flag:'wx',mode:0o600});
 console.log('Local configuration created. Keep .dev.vars private; the local password is stored there.');
} catch(error) {
 if(error.code!=='EEXIST')throw error;
 console.log('Existing .dev.vars preserved.');
}
