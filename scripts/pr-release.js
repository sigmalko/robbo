const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

function releaseContext(eventName, event, repository, sha, refName, openPulls = []) {
  const pr = eventName === 'pull_request' ? event.pull_request :
    eventName === 'workflow_dispatch' ? openPulls.find(pr => pr.head.ref === refName && pr.head.sha === sha && pr.head.repo?.full_name === repository) : undefined;
  if (pr && pr.head.repo?.full_name === repository) {
    if (pr.head.sha !== sha) throw Error('The release must build the pull request head commit');
    const number = pr.number ?? event.number;
    const branch = pr.head.ref;
    const prUrl = pr.html_url;
    const branchUrl = `https://github.com/${repository}/tree/${encodeURIComponent(branch)}`;
    const commitUrl = `https://github.com/${repository}/commit/${sha}`;
    return {
      tag: `pr-${number}-${sha}`, title: `Robbo PR #${number} · ${branch} · ${sha.slice(0, 12)}`,
      prerelease: true, sha, pr: number, prUrl, branch, branchUrl, commitUrl,
      notes: `Preview build for testing before merge. Report feedback on the linked pull request.\n\n- Pull request: ${prUrl}\n- Branch: [${branch}](${branchUrl})\n- Built commit: ${commitUrl}\n\nDownload Robbo-Game.zip, extract it, and open Robbo-Game/index.html. This release does not merge the pull request.\n`
    };
  }
  return null;
}

function gh(args) { return execFileSync('gh', args, { encoding: 'utf8' }); }

function main() {
  const contextPath = process.env.ROBBO_RELEASE_CONTEXT;
  if (!contextPath) throw Error('ROBBO_RELEASE_CONTEXT is required');
  if (process.argv[2] === 'prepare') {
    const event = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
    const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    const repository = process.env.GITHUB_REPOSITORY;
    const openPulls = process.env.GITHUB_EVENT_NAME === 'workflow_dispatch' ? JSON.parse(gh(['api', '--method', 'GET', `repos/${repository}/pulls`, '-f', 'state=open', '-f', `head=${repository.split('/')[0]}:${process.env.GITHUB_REF_NAME}`, '-f', 'per_page=100'])) : [];
    const context = releaseContext(process.env.GITHUB_EVENT_NAME, event, repository, sha, process.env.GITHUB_REF_NAME, openPulls);
    fs.writeFileSync(contextPath, JSON.stringify(context, null, 2) + '\n');
    return;
  }
  if (process.argv[2] !== 'publish') throw Error('Expected prepare or publish');
  const context = JSON.parse(fs.readFileSync(contextPath, 'utf8'));
  if (!context) { console.log('No same-repository pull request preview to publish.'); return; }
  const notesPath = `${contextPath}.md`;
  fs.writeFileSync(notesPath, context.notes);
  let exists = false;
  try { gh(['release', 'view', context.tag]); exists = true; } catch { /* First build of this commit. */ }
  if (exists) {
    gh(['release', 'edit', context.tag, '--title', context.title, '--notes-file', notesPath, '--prerelease', '--latest=false']);
    gh(['release', 'upload', context.tag, 'release/Robbo-Game.zip', '--clobber']);
  } else {
    gh(['release', 'create', context.tag, 'release/Robbo-Game.zip', '--target', context.sha, '--title', context.title, '--notes-file', notesPath, '--prerelease', '--latest=false']);
  }
  console.log(`Published ${context.tag} for ${context.prUrl}`);
}

module.exports = { releaseContext };
if (require.main === module) main();
