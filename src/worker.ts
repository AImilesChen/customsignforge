import {handle} from '@astrojs/cloudflare/handler';
import {maintenance} from './lib/maintenance.mjs';
export default {
 fetch:handle,
 async scheduled(_controller:ScheduledController,env:Cloudflare.Env,_ctx:ExecutionContext){await maintenance(env);}
};
