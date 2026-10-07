const { test } = require('node:test');
const assert = require('node:assert/strict');
const { releaseContext } = require('./pr-release');

const repository = 'owner/robbo';
const sha = 'a'.repeat(40);
const pr = { number: 62, html_url: 'https://github.com/owner/robbo/pull/62', head: { ref: 'feature/artwork', sha, repo: { full_name: repository } } };

test('PR previews identify the PR, branch and actual built commit and remain prereleases', () => {
  const context = releaseContext('pull_request', { number: 62, pull_request: pr }, repository, sha);
  assert.equal(context.tag, `pr-62-${sha}`);
  assert.match(context.title, /PR #62.*feature\/artwork/);
  assert.equal(context.prerelease, true);
  assert(context.notes.includes(pr.html_url));
  assert(context.notes.includes('https://github.com/owner/robbo/tree/feature%2Fartwork'));
  assert(context.notes.includes(`/commit/${sha}`));
  const newer = 'b'.repeat(40);
  assert.notEqual(releaseContext('pull_request', { pull_request: { ...pr, head: { ...pr.head, sha: newer } } }, repository, newer).tag, context.tag);
  assert.throws(() => releaseContext('pull_request', { pull_request: pr }, repository, newer), /head commit/);
});

test('manual feature-branch builds publish only when they match an open PR head', () => {
  assert.equal(releaseContext('workflow_dispatch', {}, repository, sha, pr.head.ref, [pr]).pr, 62);
  assert.equal(releaseContext('workflow_dispatch', {}, repository, 'b'.repeat(40), pr.head.ref, [pr]), null);
  assert.equal(releaseContext('workflow_dispatch', {}, repository, sha, 'other', [pr]), null);
  assert.equal(releaseContext('workflow_dispatch', {}, repository, sha, pr.head.ref, []), null);
});

test('forks and production pushes cannot publish a PR preview', () => {
  const fork = { ...pr, head: { ...pr.head, repo: { full_name: 'fork/robbo' } } };
  assert.equal(releaseContext('pull_request', { pull_request: fork }, repository, sha), null);
  assert.equal(releaseContext('push', {}, repository, sha, 'master', [pr]), null);
  assert.equal(releaseContext('push', {}, repository, sha, 'v1.0', [pr]), null);
});
