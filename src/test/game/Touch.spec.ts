import { describe, expect, it } from 'vitest';
import { ActionInput } from '../../main/game/Input';
import { PointerActions } from '../../main/game/Touch';
describe('Pointer controls', () => {
  it('keeps movement and fire independent across multitouch cancellation', () => {
    const input = new ActionInput(), touch = new PointerActions(input);
    touch.press(10, 'fire'); touch.press(20, 'left'); expect(input.command()).toEqual({ direction: 2, fire: true });
    touch.release(10); expect(input.command()).toEqual({ direction: 2, fire: false }); touch.release(20); expect(input.command()).toBeUndefined();
  });
  it('resets every captured pointer and allows a reused pointer ID', () => {
    const input = new ActionInput(), touch = new PointerActions(input); touch.press(1, 'up'); touch.press(2, 'fire'); input.release(); touch.reset();
    expect(touch.pointers.size).toBe(0); touch.press(1, 'down'); expect(input.command()).toEqual({ direction: 1, fire: false });
  });
});
