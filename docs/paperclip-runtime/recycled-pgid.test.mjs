// Operator regression check against the installed Paperclip module; no DB or credentials.
import assert from 'node:assert/strict';
import { test, after } from 'node:test';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const dist = process.env.PAPERCLIP_TEST_DIST;
assert.ok(dist, 'Set PAPERCLIP_TEST_DIST to the installed @paperclipai/server/dist');
const { getConversationOwnershipBlocker } = await import(pathToFileURL(path.join(dist, 'services/conversation-continuation.js')));
const { readProcessStartedAt } = await import(pathToFileURL(path.join(dist, 'services/hot-restart.js')));
// The child is ours, detached, and receives no network/input. Only this child is stopped.
const child = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { detached: true, stdio: 'ignore' });
await once(child, 'spawn');
after(async () => { const done = once(child, 'exit'); child.kill(); await done; });
const started = new Date(await readProcessStartedAt(child.pid));
assert.ok(Number.isFinite(started.getTime()));
const current = { id: 'run', agentId: 'agent', processPid: child.pid, processGroupId: child.pid, processStartedAt: started };
function db(run, lease = false) {
  return { select: () => ({ from: () => ({ where: () => ({ orderBy: async () => [{ run, activeLease: lease }] }) }) }) };
}
const probe = (run, lease = false) => getConversationOwnershipBlocker(db(run, lease), 'company', 'issue');

test('same live leader and group retain ownership hold', async () => {
  assert.equal((await probe(current))?.cause, 'execution_owner_active');
});
test('recycled leader and its reused group do not block a historical run', async () => {
  assert.equal(await probe({ ...current, processStartedAt: new Date(started.getTime() - 86400000) }), null);
});
test('active environment lease still blocks despite recycled leader', async () => {
  const result = await probe({ ...current, processStartedAt: new Date(started.getTime() - 86400000) }, true);
  assert.equal(result?.cause, 'execution_owner_active');
  assert.match(result.nextAction, /lease/);
});
test('missing start-time evidence retains the hold', async () => {
  assert.equal((await probe({ ...current, processStartedAt: null }))?.cause, 'execution_owner_active');
});
test('live group without a recorded leader retains the hold', async () => {
  assert.equal((await probe({ ...current, processPid: null }))?.cause, 'execution_owner_active');
});
test('different live group is not dismissed by a recycled PID', async () => {
  assert.equal((await probe({ ...current, processPid: process.pid, processStartedAt: new Date(0) }))?.cause, 'execution_owner_active');
});
test('absent process identifiers and no lease are clear', async () => {
  assert.equal(await probe({ ...current, processPid: null, processGroupId: null }), null);
});
