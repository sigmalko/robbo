const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.ROBBO_CHROMIUM, args: ['--no-sandbox'] });
  try {
    const context = await browser.newContext({ viewport: { width: 800, height: 900 }, hasTouch: true });
    const page = await context.newPage();
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(pathToFileURL(path.resolve('release/Robbo-Game/index.html')).href + '#test');
    await page.evaluate(() => { window.robboTest.load(['ssssssss', 'sR.....s', 's......s', 'ssssssss']); window.robboTest.inventory(9); });
    await page.locator('.touch-controls').scrollIntoViewIfNeeded();
    const point = async selector => { const box = await page.locator(selector).boundingBox(); return { x: box.x + box.width / 2, y: box.y + box.height / 2 }; };
    const fire = { ...await point('[data-action="fire"]'), id: 1 };
    const right = { ...await point('[data-action="right"]'), id: 2 };
    const cdp = await context.newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [fire] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [fire, right] });
    assert.equal(await page.locator('[data-action="fire"]').getAttribute('aria-pressed'), 'true');
    await page.evaluate(() => window.robboTest.step());
    assert.equal((await page.evaluate(() => window.robboTest.snapshot())).ammo, 8, 'Two independent touches should aim and fire');
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
    assert.equal(await page.locator('[data-action="fire"]').getAttribute('aria-pressed'), 'false');
    await page.evaluate(() => window.robboTest.step(2));
    assert.equal((await page.evaluate(() => window.robboTest.snapshot())).ammo, 8, 'Cancellation must release held fire');
    // Native keyboard activation of the visible direction buttons remains usable.
    await page.locator('[data-action="down"]').focus(); await page.keyboard.press('Enter');
    await page.evaluate(() => window.robboTest.step());
    assert.deepEqual((await page.evaluate(() => window.robboTest.snapshot())).robot, [1, 2]);
    await page.locator('.touch-controls button', { hasText: 'Pause / resume' }).click();
    const tick = await page.locator('#board').getAttribute('data-tick');
    await page.locator('[data-action="right"]').click(); await page.evaluate(() => window.robboTest.step(2));
    assert.equal(await page.locator('#board').getAttribute('data-tick'), tick, 'Touch controls must not advance a paused world');
    await page.evaluate(() => window.robboTest.load(['ssssssss', 'sR.....s', 's......s', 'ssssssss']));
    await page.getByText('Input settings', { exact: true }).click();
    await page.getByLabel('Key for right', { exact: true }).press('d');
    await page.locator('#board').click(); await page.keyboard.press('d');
    await page.evaluate(() => window.robboTest.step());
    assert.deepEqual((await page.evaluate(() => window.robboTest.snapshot())).robot, [2, 1], 'Remapped key should drive the shared action layer');
    await page.keyboard.press('ArrowRight'); await page.evaluate(() => window.robboTest.step());
    assert.deepEqual((await page.evaluate(() => window.robboTest.snapshot())).robot, [2, 1], 'Old binding must be removed');
    await page.evaluate(() => {
      window.robboTest.load(['ssssssss', 'sR.....s', 's......s', 'ssssssss']);
      window.fakePads = [{ connected: true, mapping: 'standard', axes: [1, 1], buttons: Array.from({ length: 16 }, () => ({ pressed: false })) }];
      navigator.getGamepads = () => window.fakePads;
      window.robboTest.step();
    });
    assert.deepEqual((await page.evaluate(() => window.robboTest.snapshot())).robot, [2, 1], 'Gamepad axis ties must produce one cardinal command');
    await page.evaluate(() => { window.fakePads[0].buttons[9].pressed = true; window.robboTest.step(); });
    const padPauseTick = await page.locator('#board').getAttribute('data-tick');
    await page.evaluate(() => window.robboTest.step(3));
    assert.equal(await page.locator('#board').getAttribute('data-tick'), padPauseTick, 'Held Start must not repeatedly toggle pause');
    await page.evaluate(() => { navigator.getGamepads = () => []; });
    for (const theme of ['java-atlas-v1', 'planet-journey-4']) {
      await page.evaluate(() => window.robboTest.load(['ssssssss', 'sR.....s', 's......s', 'ssssssss']));
      await page.locator('#settings').click();
      await page.selectOption('#theme', theme);
      await page.waitForFunction(id => document.documentElement.dataset.theme === id, theme);
      await page.locator('#back-to-game').click();
      assert.equal(await page.evaluate(() => document.activeElement.id), 'board', 'Returning to play restores keyboard focus');
      await page.keyboard.press('d'); await page.evaluate(() => window.robboTest.step());
      assert.deepEqual((await page.evaluate(() => window.robboTest.snapshot())).robot, [2, 1], 'Keyboard movement works immediately after Settings');
      await page.locator('#pause').click();
      assert.equal(await page.evaluate(() => document.activeElement.id), 'board', 'Gameplay toolbar actions retain keyboard control');
      await page.keyboard.press('p'); await page.keyboard.press('d'); await page.evaluate(() => window.robboTest.step());
      assert.deepEqual((await page.evaluate(() => window.robboTest.snapshot())).robot, [3, 1]);
    }
    assert.deepEqual(errors, []);
    console.log('Input browser smoke passed: native multitouch fire, cancellation, accessible activation, remapping, gamepad cardinal input and pause.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
