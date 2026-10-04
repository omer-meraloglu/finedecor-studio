import {existsSync,writeFileSync,mkdirSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
if(!existsSync('.env.local')){writeFileSync('.env.local',['editor','technical','administrator'].map(role=>`FD_${role.toUpperCase()}_TOKEN=${randomBytes(32).toString('hex')}`).join('\n')+'\n',{mode:0o600});console.log('Created local role credentials in .env.local. Keep them private; use the matching role token in /en/admin.');}else console.log('Existing local credentials preserved.');
mkdirSync('.local-data',{recursive:true,mode:0o700});
