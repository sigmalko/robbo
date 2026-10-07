import { describe, expect, it } from 'vitest';
import { auditSymbols, symbolMeaning, requireSupportedSymbols } from '../../../src/engine/level-symbols';
import { packs } from '../../../src/generated/packs';

describe('Explicit map-format symbols', () => {
  it('audits all 112 authored boards without changing Java meanings', () => {
    for (const pack of packs) for (const level of pack.levels) expect(auditSymbols(level.rows, 'java', pack.id, level.number)).toEqual([]);
    expect(symbolMeaning('+', 'java')?.kind).toBe('wall');
    expect(symbolMeaning('X', 'java')?.kind).toBe('stop');
  });
  it('reports all unsupported GNU symbols with location instead of erasing them', () => {
    expect(auditSymbols(['R+k$'], 'gnu', 'candidate', 9)).toEqual([
      'candidate, planet 9, (1,0), symbol "+": GNU life pickups are unsupported; explicit conversion approval is required',
      'candidate, planet 9, (2,0), symbol "k": GNU barbed wire has no verified compatible artwork or selected campaign',
      'candidate, planet 9, (3,0), symbol "$": unknown symbol'
    ]);
    expect(() => requireSupportedSymbols(['R$'], 'java', 'test', 2)).toThrow('test, planet 2, (1,0)');
  });
  it('keeps prototype screw aliases separate from unknown wall artwork', () => {
    expect(symbolMeaning('x', 'prototype')?.kind).toBe('screw');
    expect(symbolMeaning('x', 'java')).toBeUndefined();
    expect(auditSymbols(['IY'], 'prototype', 'prototype', 1)).toHaveLength(2);
  });
});
