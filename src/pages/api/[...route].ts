import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { handleAPI } from '../../lib/api.mjs';
export const ALL: APIRoute = ({request,params}) => handleAPI(request,env,params.route||'');
