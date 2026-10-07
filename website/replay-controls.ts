import { ReplayRecorder, playReplay } from '../src/main/game/Replay';
import type { GameSession } from '../src/main/game/Session';
import type { Pack } from '../src/main/game/model';
export function replayControls(packs: Pack[], current: () => GameSession, replace: (session: GameSession) => void): { recorder?: ReplayRecorder; viewing: boolean; cancel(): void } {
  const state: { recorder?: ReplayRecorder; viewing: boolean; cancel(): void } = { viewing: false, cancel() { state.recorder = undefined; state.viewing = false; } };
  const controls = document.createElement('details'); controls.innerHTML = '<summary>Replay / bug report</summary><p>Record starts a fresh attempt on this planet. Download your recording to attach to a bug report. Import validates and displays the final recorded state.</p>';
  const status = document.createElement('p'); status.setAttribute('role', 'status');
  const record = document.createElement('button'); record.textContent = 'Record fresh attempt';
  record.onclick = () => { current().restart(); state.viewing = false; state.recorder = new ReplayRecorder(current()); replace(current()); status.textContent = 'Recording normal commands and simulation ticks.'; };
  const download = document.createElement('button'); download.textContent = 'Download replay';
  download.onclick = () => {
    if (!state.recorder) { status.textContent = 'Start a recording first.'; return; }
    const url = URL.createObjectURL(new Blob([state.recorder.export()], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = `robbo-${current().pack.id}-${state.recorder.data.planet}-replay.json`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 0);
  };
  const file = document.createElement('input'); file.type = 'file'; file.accept = '.json,application/json'; file.setAttribute('aria-label', 'Import replay');
  file.onchange = async () => {
    try {
      const selected = file.files?.[0]; if (!selected) return;
      if (selected.size > 20000000) throw Error('Replay file is too large');
      const session = playReplay(await selected.text(), packs); state.recorder = undefined; state.viewing = true; replace(session); status.textContent = 'Replay verified. Final state displayed; restart to return to normal play.';
    } catch (error) { status.textContent = error instanceof Error ? error.message : 'Invalid replay'; }
  };
  controls.append(record, download, file, status); document.querySelector('footer')!.before(controls); return state;
}
