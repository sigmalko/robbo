const symbols = ".R!T%'D#~b?&M=^@*V}HXs-OoSpPQq+";
const tag = (body, name) => body.match(new RegExp(`\\[${name}\\]\\n([^\\[]*)`))?.[1].trim() || '';

/** Parse into a temporary value: no partial world or generated output is published on failure. */
function parseCampaign(input, config, source = config.file || config.id) {
  const fail = (planet, message) => { throw Error(`${source}:${planet}: ${message}`); };
  if (!config.id || !Number.isInteger(config.expectedLevels) || config.expectedLevels < 1 || config.expectedLevels > 10000) fail('header', 'invalid pack manifest');
  const text = input.replace(/\r/g, '');
  const hasOffsets = text.includes('[offset]\n');
  const sections = hasOffsets ? text.split(/\[offset\]\n/) : text.split(/(?=\[level\]\n)/);
  const header = sections.shift();
  const pack = { id: config.id, name: tag(header, 'name'), lastLevel: Number(tag(header, 'last_level')), levels: [] };
  const diagnostics = [];
  if (!pack.name || pack.lastLevel !== config.expectedLevels) fail('header', 'declared campaign count differs from manifest');
  for (const section of sections) {
    const number = Number(tag(section, 'level'));
    if (!Number.isInteger(number) || number !== pack.levels.length + 1) fail(tag(section, 'level'), 'expected consecutive numeric planet ID');
    const dimensions = tag(section, 'size').split('.');
    const [width, height] = dimensions.map(Number);
    if (dimensions.length !== 2 || !Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width > 200 || height > 200) fail(number, 'dimensions must be integers within 1..200');
    if (config.width && width !== config.width || config.height && height !== config.height) fail(number, 'dimensions differ from canonical manifest');
    const rows = tag(section, 'data').split('\n');
    if (rows.length !== height || rows.some(row => row.length !== width)) fail(number, 'incomplete data for declared dimensions');
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) if (!symbols.includes(rows[y][x])) fail(number, `unknown symbol ${JSON.stringify(rows[y][x])} at ${x},${y}`);
    for (const symbol of ['R', '!']) if (rows.join('').split(symbol).length !== 2) fail(number, `expected one ${symbol}; nonplayable endings need an explicit supported format`);
    const options = {};
    const seen = new Set();
    for (const record of tag(section, 'additional').split('\n').filter(Boolean)) {
      const fields = record.split('.');
      if (fields.length === 1 && /^\d+$/.test(record)) continue; // Historical counts are advisory, never record limits.
      const [x, y] = fields.slice(0, 2).map(Number);
      const values = fields.slice(3).map(Number);
      if (fields.length < 4 || !Number.isInteger(x) || !Number.isInteger(y) || x < 0 || x >= width || y < 0 || y >= height || values.some(v => !Number.isInteger(v) || v < 0)) fail(number, `invalid metadata ${record}`);
      const position = `${x},${y}`;
      if (seen.has(position) && config.duplicateMetadata !== 'last-wins') fail(number, `duplicate metadata at ${position}`);
      seen.add(position);
      const expected = { '}': 6, '^': 3, '&': 2, 'M': 1, '@': 1, '*': 1, '=': 1 }[fields[2]];
      if (!expected || values.length !== expected || fields.slice(3).some(v => !/^\d+$/.test(v))) fail(number, `invalid option count/type ${record}`);
      if (['M', '@', '*', '='].includes(fields[2]) && values[0] > 3) fail(number, `invalid direction ${record}`);
      if (fields[2] === '^' && (values[0] > 3 || values[1] > 3 || values[2] > 1)) fail(number, `invalid bird options ${record}`);
      if (fields[2] === '}' && (values[0] > 3 || values[1] > 3 || values[2] > 2 || values.slice(3).some(v => v > 1))) fail(number, `invalid cannon options ${record}`);
      if (rows[y][x] !== fields[2]) {
        if (!config.allowStaleMetadata) fail(number, `metadata symbol mismatch at ${position}: ${record}`);
        diagnostics.push({ pack: config.id, level: number, x, y, record, actual: rows[y][x] });
        continue;
      }
      options[position] = values;
    }
    const colour = tag(section, 'colour') || tag(header, 'default_level_colour');
    if (!/^[0-9a-f]{6}$/i.test(colour)) fail(number, 'invalid color; multicolor palettes require a supported format');
    pack.levels.push({ number, width, height, colour: `#${colour}`, author: tag(section, 'author'), notes: tag(section, 'level_notes'), offset: hasOffsets ? section.split('\n')[0] : '', rows, options });
  }
  if (pack.levels.length !== config.expectedLevels) fail('header', 'incomplete campaign');
  return { pack, diagnostics };
}

module.exports = { parseCampaign };
