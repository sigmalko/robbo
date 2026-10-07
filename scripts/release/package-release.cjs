const fs = require("fs");
const path = require("path");

const root = process.cwd();
const releaseRoot = path.join(root, "release", "robbo");

fs.rmSync(releaseRoot, { recursive: true, force: true });
fs.mkdirSync(path.join(releaseRoot, "dist"), { recursive: true });

fs.cpSync(path.join(root, "website"), releaseRoot, {
  recursive: true,
  filter: source => !source.endsWith(".ts")
});
fs.copyFileSync(path.join(root, "dist", "robbo.js"), path.join(releaseRoot, "dist", "robbo.js"));
fs.copyFileSync(path.join(root, "dist", "robbo.js.map"), path.join(releaseRoot, "dist", "robbo.js.map"));
const license = path.join(root, "LICENSE");
if (fs.existsSync(license)) fs.copyFileSync(license, path.join(releaseRoot, "LICENSE"));

const indexPath = path.join(releaseRoot, "index.html");
const index = fs.readFileSync(indexPath, "utf8").replace(
  '<script type="module" src="../src/app/main.ts"></script>',
  '<script defer src="dist/robbo.js"></script>'
);
fs.writeFileSync(indexPath, index);

fs.writeFileSync(
  path.join(releaseRoot, "README.txt"),
  "Open index.html in a modern web browser to play Robbo. No installation or web server is required. Click Start game to enable sound. Use arrow keys to move, Ctrl + arrow to fire, R to retry and P to pause. Collect screws and enter the flashing ship to advance through 56 planets. The campaign selector includes both original legacy map packs.\n"
);

// Keep the identity of a downloaded PR build available after extraction.
if (process.env.ROBBO_RELEASE_CONTEXT) {
  const context = JSON.parse(fs.readFileSync(process.env.ROBBO_RELEASE_CONTEXT, 'utf8'));
  if (context) {
    fs.writeFileSync(path.join(releaseRoot, 'BUILD-INFO.json'), JSON.stringify(context, null, 2) + '\n');
    fs.appendFileSync(path.join(releaseRoot, 'README.txt'), `\n${context.title}\nPull request: ${context.prUrl}\nBranch: ${context.branchUrl}\nCommit: ${context.commitUrl}\nReport feedback on this pull request before deciding to merge.\n`);
  }
}
