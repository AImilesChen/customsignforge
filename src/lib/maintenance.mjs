export async function maintenance(env){
 const now=Math.floor(Date.now()/1000);
 await env.DB.batch([
  env.DB.prepare("DELETE FROM measurement_events WHERE created_at < datetime('now','-90 days')"),
  env.DB.prepare('DELETE FROM admin_sessions WHERE expires_at<?').bind(now),
  env.DB.prepare('DELETE FROM email_challenges WHERE expires_at<?').bind(now),
  env.DB.prepare('DELETE FROM oauth_states WHERE expires_at<?').bind(now),
  env.DB.prepare('DELETE FROM rate_limits WHERE bucket<?').bind(Math.floor(Date.now()/300000)-2)
 ]);
 return {ok:true};
}
