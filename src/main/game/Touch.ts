import { ActionInput } from './Input';
import type { Action } from './Input';
import type { Direction } from './model';

/** Pointer identities are independent: releasing fire never releases a held direction. */
export class PointerActions {
  readonly pointers = new Map<number, Action>();
  constructor(readonly input: ActionInput) {}
  press(id: number, action: Action): void { this.release(id); this.pointers.set(id, action); this.input.set(`pointer:${id}`, action, true); }
  release(id: number): void { this.pointers.delete(id); this.input.set(`pointer:${id}`, 'fire', false); }
  reset(): void { for (const id of this.pointers.keys()) this.release(id); }
}

export function attachTouch(input: ActionInput, options: {
  command: (direction: Direction, fire: boolean) => void;
  pause: () => void;
  retry: () => void;
  active: () => boolean;
  start: () => void;
}): { reset: () => void } {
  const state = new PointerActions(input);
  const panel = document.createElement('section'); panel.className = 'touch-controls'; panel.setAttribute('aria-label', 'Touch game controls');
  const description = document.createElement('p'); description.textContent = 'Hold a direction to move. Hold Fire and a direction to shoot. Fire is momentary.';
  const buttons = new Map<Action, HTMLButtonElement>();
  const captures = new Map<number, HTMLButtonElement>();
  const refresh = () => { for (const [action, button] of buttons) if (action === 'fire') button.setAttribute('aria-pressed', String([...state.pointers.values()].includes(action))); };
  const command = () => { const action = input.command(); if (action && options.active()) options.command(action.direction, action.fire); };
  const release = (id: number) => { state.release(id); captures.delete(id); refresh(); };
  for (const [action, text] of [['up', '↑ Up'], ['left', '← Left'], ['down', '↓ Down'], ['right', '→ Right'], ['fire', 'Fire (hold)']] as const) {
    const button = document.createElement('button'); button.type = 'button'; button.textContent = text; button.dataset.action = action;
    button.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      event.preventDefault(); options.start(); if (!options.active()) return;
      state.press(event.pointerId, action); captures.set(event.pointerId, button); button.setPointerCapture(event.pointerId); refresh();
      if (action !== 'fire') command();
    });
    for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(name, event => release((event as PointerEvent).pointerId));
    // Native activation provides a single step for keyboard/assistive technology.
    button.addEventListener('click', event => {
      if (event.detail !== 0 || action === 'fire') return;
      options.start(); if (!options.active()) return;
      state.press(-1, action); command(); release(-1);
    });
    button.addEventListener('keydown', event => {
      if (action !== 'fire' || (event.key !== ' ' && event.key !== 'Enter')) return;
      event.preventDefault(); if (!event.repeat && options.active()) { state.press(-2, action); refresh(); }
    });
    button.addEventListener('keyup', event => { if (event.key === ' ' || event.key === 'Enter') release(-2); });
    button.addEventListener('blur', () => release(-2));
    buttons.set(action, button); panel.append(button);
  }
  for (const [text, callback] of [['Pause / resume', options.pause], ['Retry planet', options.retry]] as const) {
    const button = document.createElement('button'); button.type = 'button'; button.textContent = text; button.addEventListener('click', callback); panel.append(button);
  }
  description.id = 'touch-description'; panel.setAttribute('aria-describedby', description.id);
  panel.append(description); (document.querySelector('.game') ?? document.querySelector('main'))?.append(panel);
  const reset = () => {
    const held = [...captures]; state.reset(); captures.clear(); refresh();
    for (const [id, button] of held) if (button.hasPointerCapture(id)) button.releasePointerCapture(id);
  };
  addEventListener('blur', reset); document.addEventListener('visibilitychange', () => { if (document.hidden) reset(); });
  return { reset };
}
