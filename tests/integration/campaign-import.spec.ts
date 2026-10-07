import { describe, expect, it } from 'vitest';
import { parseCampaign } from '../../scripts/levels/campaign-parser.cjs';
const source = '[name]\nFixture\n[last_level]\n1\n[default_level_colour]\n608050\n[level]\n1\n[size]\n5.3\n[data]\nsssss\nsR!.s\nsssss\n[additional]\n0\n[end]\n';
const config = { id: 'fixture', expectedLevels: 1 };

describe('Complete campaign parsing before publication', () => {
  it('accepts an independently sized pack without offset tags', () => {
    const { pack } = parseCampaign(source, config, 'fixture.dat');
    expect(pack).toMatchObject({ id: 'fixture', lastLevel: 1 });
    expect(pack.levels[0]).toMatchObject({ number: 1, width: 5, height: 3, offset: '' });
  });
  it.each(['0.3', '201.3', '5.1.3', 'NaN.3', '5.2'])('rejects invalid or truncated size %s', size => {
    expect(() => parseCampaign(source.replace('5.3', size), config)).toThrow(/fixture:1:/);
  });
  it('identifies unsupported symbols and their coordinates', () => {
    expect(() => parseCampaign(source.replace('sR!.s', 'sR!ks'), config, 'custom.dat')).toThrow('custom.dat:1: unknown symbol "k" at 3,1');
  });
  it('validates additional coordinates against the actual board', () => {
    expect(() => parseCampaign(source.replace('[additional]\n0', '[additional]\n1\n5.1.M.0'), config)).toThrow('invalid metadata');
  });
  it('rejects duplicate metadata, invalid arity, and symbol mismatch for new packs', () => {
    for (const records of ['3.1.M.0\n3.1.M.0', '3.1.M.0.0', '3.1.M.0']) {
      expect(() => parseCampaign(source.replace('[additional]\n0', `[additional]\n${records}`), config)).toThrow();
    }
  });
  it('keeps the canonical duplicate/stale policy explicit and diagnosed', () => {
    const text = source.replace('sR!.s', 'sR!Ms').replace('[additional]\n0', '[additional]\n1\n3.1.M.0\n3.1.M.2\n1.1.M.0');
    const { pack, diagnostics } = parseCampaign(text, { ...config, duplicateMetadata: 'last-wins', allowStaleMetadata: true });
    expect(pack.levels[0].options['3,1']).toEqual([2]);
    expect(diagnostics).toEqual([{ pack: 'fixture', level: 1, x: 1, y: 1, record: '1.1.M.0', actual: 'R' }]);
  });
  it('rejects incomplete declared campaigns and unsupported ending records', () => {
    expect(() => parseCampaign(source.replace('[last_level]\n1', '[last_level]\n2'), { ...config, expectedLevels: 2 })).toThrow('incomplete campaign');
    expect(() => parseCampaign(source.replace('[level]\n1', '[level]\nfinal'), config)).toThrow('consecutive numeric planet ID');
  });
});
