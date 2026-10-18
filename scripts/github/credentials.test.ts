import { test } from 'node:test';
import assert from 'node:assert/strict';
import { githubToken } from './credentials.ts';
const managed = { PAPERCLIP_GITHUB_BROKER_TOKEN: 'capability-fixture', PAPERCLIP_GITHUB_BROKER_URL: 'http://127.0.0.1:3100/api', GH_TOKEN: 'wrong-ambient-fixture' };
test('broker identity takes precedence and redirects are rejected', async () => {
 const token = await githubToken(managed, async (url, options) => {
  assert.equal(String(url), 'http://127.0.0.1:3100/runtime-tools/github/credentials');
  assert.equal(options?.redirect, 'error');
  assert.equal(new Headers(options?.headers).get('x-paperclip-github-capability'), managed.PAPERCLIP_GITHUB_BROKER_TOKEN);
  return Response.json({status:'available',env:{GH_TOKEN:'managed-fixture'}});
 });
 assert.equal(token,'managed-fixture');
});
test('no ambient fallback on denied or unavailable managed credentials', async () => {
 for (const response of [new Response(null,{status:403}),Response.json({status:'unavailable',env:{}})]) {
  let calls=0;
  await assert.rejects(githubToken(managed,async()=>{calls++;return response;}));
  assert.equal(calls,1);
 }
});
test('bounded retry for transport failure',async()=>{
 let calls=0;
 await assert.rejects(githubToken(managed,async()=>{calls++;throw new Error('sensitive-fixture');}),/trova|tre tentativi/);
 assert.equal(calls,3);
});
test('reject insecure broker before sending capability',async()=>{
 await assert.rejects(githubToken({...managed,PAPERCLIP_GITHUB_BROKER_URL:'http://example.com'},async()=>{throw Error('must not fetch');}),/non sicuro/);
});
test('standalone token and missing credentials',async()=>{
 assert.equal(await githubToken({GITHUB_TOKEN:'local-fixture'}),'local-fixture');
 await assert.rejects(githubToken({}),/Nessuna credenziale/);
});
test('Paperclip run without capability never uses inherited credentials', async () => {
 for (const marker of ['PAPERCLIP_AGENT_ID','PAPERCLIP_RUN_ID','PAPERCLIP_GITHUB_BROKER_URL']) {
  await assert.rejects(githubToken({[marker]:'runtime-fixture',GH_TOKEN:'wrong-ambient-fixture'}),/senza capability/);
 }
});
