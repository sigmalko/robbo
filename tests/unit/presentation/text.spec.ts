import { describe, expect, it } from 'vitest';
import { english, text } from '../../../src/presentation/i18n/messages';
describe('Unicode UI catalog', () => {
  it('falls back on absent, blank or malformed translations', () => {
    const values = { planet: 2, total: 56, author: 'Author', notes: '' };
    const expected = text('planet.info', values);
    expect(text('planet.info', values, {})).toBe(expected);
    expect(text('planet.info', values, { 'planet.info': '' })).toBe(expected);
    expect(text('planet.info', values, { 'planet.info': 'Planet {planet}' })).toBe(expected);
    expect(text('planet.info', values, { 'planet.info': '{planet}{total}{author}{notes}{missing}' })).toBe(expected);
  });
  it('preserves Unicode diacritics and arbitrarily long text without HTML interpretation', () => {
    const unicode = 'Zażółć gęślą jaźń — '.repeat(30) + '<script>text</script>';
    expect(text('action.start', {}, { 'action.start': unicode })).toBe(unicode);
    expect(text('planet.info', { planet: 1, total: 56, author: 'Łukasz', notes: ' · Żółw' })).toContain('Łukasz · Żółw');
  });
  it('provides explicit help for the active rules instead of silently enabling GNU alternatives', () => {
    expect(english['help.doors.body']).toContain('survive explosions');
    expect(english['help.magnets.body']).toContain('do not attract other objects');
    expect(english['help.hazards.body']).toContain('GNU rules are not active');
    expect(Object.values(english).every(value => value.trim().length > 0)).toBe(true);
  });
});
