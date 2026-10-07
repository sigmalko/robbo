const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { readFileSync } = require('node:fs');
const path = require('node:path');

// Source bytes are a compatibility contract, including on Windows checkouts.
const hashes = {
  'robbo01.dat': '8cde5070e81184bb664a25a25922b24d47fb2f5ef957b3ff4d91b676b7957fb8',
  'robbo02.dat': 'fe6461631f7e8e7b214e841af53b0c5f9d043731ae502125e1e80a8d5957813f'
};
for (const [file, expected] of Object.entries(hashes)) {
  test(`${file} retains its canonical source bytes`, () => {
    const bytes = readFileSync(path.join(__dirname, '../../resources/levels', file));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), expected);
  });
}
