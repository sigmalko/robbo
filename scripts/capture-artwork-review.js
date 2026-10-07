// Capture immutable visual evidence without changing game code or simulation rules.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawn, execFileSync } = require('node:child_process');
const { chromium } = require('playwright');

async function main() {
  const outputArg = process.argv.indexOf('--output');
  if (outputArg < 0 || !process.argv[outputArg + 1]) throw Error('Usage: npm run capture:artwork -- --output <new-directory>');
  const output = path.resolve(process.argv[outputArg + 1]);
  if (fs.existsSync(output)) throw Error('Use a new output directory to preserve earlier review evidence');
  const commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const dirty = !!execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim();
  fs.mkdirSync(output, { recursive: true });
  const server = spawn(process.execPath, ['scripts/serve.js'], { stdio: ['ignore', 'pipe', 'inherit'] });
  let browser;
  try {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(Error('Preview server did not start within 10 seconds')), 10000);
      const finish = callback => value => { clearTimeout(timeout); callback(value); };
      server.stdout.once('data', finish(resolve)); server.once('error', finish(reject));
      server.once('exit', finish(code => reject(Error(`Preview server exited: ${code}`))));
    });
    browser = await chromium.launch({ executablePath: process.env.ROBBO_CHROMIUM, args: ['--no-sandbox'] });
    const page = await browser.newPage({ viewport: { width: 900, height: 1100 }, deviceScaleFactor: 2 });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:8080/#test');
    await page.waitForFunction(() => window.robboTest && document.documentElement.dataset.theme);
    await page.evaluate(() => window.robboTest.planet(1, '02'));
    const before = await page.evaluate(() => window.robboTest.snapshot());
    const captures = [];
    for (let index = 1; index <= 10; index++) {
      const id = `planet-journey-${index}`, file = `journey-${String(index).padStart(2, '0')}.png`;
      await page.selectOption('#theme', id);
      await page.waitForFunction(id => document.documentElement.dataset.theme === id, id);
      assert.equal(await page.locator('#overlay').isVisible(), false);
      assert.deepEqual(await page.evaluate(() => window.robboTest.snapshot()), before);
      await page.locator('.game').screenshot({ path: path.join(output, file) });
      captures.push({ id, name: await page.locator('#theme option:checked').textContent(), file });
    }
    await page.evaluate(() => window.robboTest.load(['ssssssssssssssss', 'sR.T.M.V.!.....s', "s%'D#~b?&......s", 's=@*^}HX.......s', 'ssssssssssssssss']));
    await page.selectOption('#theme', 'planet-journey-2');
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'planet-journey-2');
    const box = await page.locator('#board').boundingBox();
    await page.screenshot({ path: path.join(output, 'objects.png'), clip: { x: box.x, y: box.y, width: box.width, height: box.width * 5 / 16 } });
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(output, 'manifest.json'), JSON.stringify({
      capturedAt: new Date().toISOString(), commit, dirty, node: process.version, browser: browser.version(),
      viewport: { width: 900, height: 1100 }, deviceScaleFactor: 2,
      pack: '02', planet: 1, simulationFrozen: true, captures,
      objectFixture: { theme: 'planet-journey-2', file: 'objects.png' }
    }, null, 2) + '\n');
    console.log(`Saved ten layout screenshots, an object close-up and a provenance manifest to ${output}`);
  } finally { await browser?.close(); server.kill(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
