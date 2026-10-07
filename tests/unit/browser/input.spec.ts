import { describe, expect, it } from 'vitest';
import { ActionInput } from '../../../src/browser/input/action-input';
describe('Shared cardinal input', () => {
  it('prioritizes the newest held device and restores the previous direction on release', () => {
    const input = new ActionInput(); input.set('key:up', 'up', true); input.set('touch:1', 'right', true); input.set('key:ctrl', 'fire', true);
    expect(input.command()).toEqual({ direction: 0, fire: true }); input.release('touch:'); expect(input.command()?.direction).toBe(3); input.release(); expect(input.command()).toBeUndefined();
  });
  it('remaps gamepad fire and rejects button conflicts', () => {
    const input = new ActionInput(); expect(input.bindPad('fire', 9)).toBeTruthy(); expect(input.bindPad('fire', 1)).toBeUndefined();
    const buttons = Array.from({ length: 16 }, () => ({ pressed: false, touched: false, value: 0 })); buttons[1].pressed = true; input.gamepad({ axes: [1, 0], buttons }); expect(input.command()).toEqual({ direction: 0, fire: true });
  });
  it('requires held gamepad buttons to release after a lifecycle reset', () => {
    const input = new ActionInput(); const buttons = Array.from({ length: 16 }, () => ({ pressed: false, touched: false, value: 0 })); buttons[9].pressed = true;
    const pad = { axes: [0, 0], buttons }; expect(input.gamepad(pad)).toEqual(['pause']); input.release();
    expect(input.gamepad(pad)).toEqual([]); buttons[9].pressed = false; input.gamepad(pad); buttons[9].pressed = true; expect(input.gamepad(pad)).toEqual(['pause']);
  });
  it('rejects conflicts and browser keys without changing bindings', () => {
    const input = new ActionInput(); expect(input.bind('up', 'ArrowDown')).toBeTruthy(); expect(input.bind('up', 'Tab')).toBeTruthy(); expect(input.bind('up', 'w')).toBeUndefined();
  });
  it('uses one dominant axis, dead zone and rising button edges; disconnect releases', () => {
    const input = new ActionInput(); const buttons = Array.from({ length: 16 }, () => ({ pressed: false, touched: false, value: 0 })); buttons[9].pressed = true;
    expect(input.gamepad({ axes: [.2, .1], buttons })).toEqual(['pause']); expect(input.command()).toBeUndefined();
    expect(input.gamepad({ axes: [.7, -.8], buttons })).toEqual(['up']); expect(input.command()?.direction).toBe(3);
    input.gamepad(null); expect(input.held.size).toBe(0);
  });
});
