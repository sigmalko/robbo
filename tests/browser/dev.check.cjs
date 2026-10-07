const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { chromium } = require('playwright');

async function main() {
  const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '8082', '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'] });
  let browser;
  try {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(Error('Vite did not start within 15 seconds')), 15000);
      const finish = callback => value => { clearTimeout(timeout); callback(value); };
      let output = '';
      server.stdout.on('data', chunk => {
        output += chunk;
        if (output.includes('http://127.0.0.1:8082/')) finish(resolve)();
      });
      server.once('error', finish(reject));
      server.once('exit', finish(code => reject(Error(`Vite exited: ${code}`))));
    });
    browser = await chromium.launch({ executablePath: process.env.ROBBO_CHROMIUM });
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    await page.goto('http://127.0.0.1:8082/');
    // Static HTML alone also has a Start button; assert bootstrap and actual ticks.
    await page.waitForFunction(() => document.querySelector('#theme').options.length === 12 && document.documentElement.dataset.theme);
    await page.locator('#start').click();
    await page.waitForFunction(() => document.querySelector('#board').dataset.tick > 0);
    await page.locator('#pause').click();
    assert.equal(await page.locator('#state-title').textContent(), 'Paused');
    await page.selectOption('#theme', 'planet-journey-4');
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'planet-journey-4');
    assert.equal(await page.locator('.hud .icon canvas').count(), 4);
    assert.deepEqual(errors, []);
    console.log('Vite dev passed: entrypoint outside website root, gameplay, pause and imported artwork.');
  } finally {
    if (browser) await browser.close();
    server.kill();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
