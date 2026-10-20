import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fixture,request,customerHeaders} from './helpers.mjs';
import {siteIdentity} from '../src/lib/site-identity.mjs';
import {actor,issueSession} from '../src/lib/auth.mjs';

test('admin entry is based on a verified allowlisted session, without granting customer tokens administrative access',async()=>{
 const f=fixture();try{
  assert.deepEqual(await siteIdentity(request(''),f.env),{customer:null,canManage:false});
  const ordinary=await customerHeaders(f.env,'buyer@example.test');
  const regular=await siteIdentity(request('', 'GET',undefined,ordinary),f.env);
  assert.equal(regular.customer.email,'buyer@example.test');assert.equal(regular.canManage,false);
  const owner=await customerHeaders(f.env,'Owner@Example.test');
  assert.equal((await siteIdentity(request('', 'GET',undefined,owner),f.env)).canManage,true);
  await assert.rejects(actor(request('admin/', 'GET',undefined,owner),f.env),e=>e.status===401);
  f.env.ADMIN_EMAILS='other@example.test';
  assert.equal((await siteIdentity(request('', 'GET',undefined,owner),f.env)).canManage,false);
  f.env.ADMIN_EMAILS='owner@example.test';
  f.sqlite.prepare('UPDATE customer_sessions SET expires_at=0').run();
  assert.equal((await siteIdentity(request('', 'GET',undefined,owner),f.env)).canManage,false);
 }finally{f.close()}
});

test('valid administrator sessions expose the entry; forged and revoked identities do not',async()=>{
 const f=fixture();try{
  const token=await issueSession(f.env,'owner@example.test'),headers={cookie:'csf_admin='+token};
  assert.deepEqual(await siteIdentity(request('', 'GET',undefined,headers),f.env),{customer:null,canManage:true});
  const ordinary=await customerHeaders(f.env,'buyer@example.test');
  assert.equal((await siteIdentity(request('', 'GET',undefined,{...ordinary,'X-Admin-Email':'owner@example.test',cookie:ordinary.cookie+'; csf_admin=forged'}),f.env)).canManage,false);
  f.sqlite.prepare('DELETE FROM admin_sessions').run();
  assert.equal((await siteIdentity(request('', 'GET',undefined,headers),f.env)).canManage,false);
  assert.equal((await siteIdentity(request('', 'GET',undefined,{'Cf-Access-Jwt-Assertion':'forged'}),f.env)).canManage,false);
 }finally{f.close()}
});
