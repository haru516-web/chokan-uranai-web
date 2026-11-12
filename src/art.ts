const artFiles = import.meta.glob('../assets/art/*', { eager: true, import: 'default', query: '?url' }) as Record<string, string>;
const deityFiles = import.meta.glob('../img/*', { eager: true, import: 'default', query: '?url' }) as Record<string, string>;

function find(files: Record<string, string>, name: string) {
  const entry = Object.entries(files).find(([path]) => path.endsWith('/' + name));
  if (!entry) throw new Error('Missing web asset: ' + name);
  return entry[1];
}

/** あれば使う画像（Codex に依頼中の追加アート）。無いあいだは undefined で、画面は絵文字や図形で代用する。 */
const optional = (name: string, prefix = false) => Object.entries(artFiles).find(([path]) => {
  const file = path.slice(path.lastIndexOf('/') + 1);
  return prefix ? file.startsWith(name) && file.endsWith('.webp') : file === name;
})?.[1];
export const tierArt = Array.from({ length: 5 }, (_, i) => optional('tier-0' + (i + 1) + '.webp'));
export const ritualBg = optional('ritual-bg.webp');
export const iconArt = {
  compass: optional('icon-compass.webp'), question: optional('icon-question.webp'), book: optional('icon-book.webp'),
  work: optional('icon-work.webp'), love: optional('icon-love.webp'), money: optional('icon-money.webp'), health: optional('icon-health.webp'),
};
/** タロットのカード絵。番号（0〜21）で探す。Codex の作業中でまだ無い札は undefined。 */
export const tarotArt = (no: number) => optional(`tarot-${String(no).padStart(2, '0')}-`, true);
/** タロットの裏面（Codex に依頼中）。無いあいだは undefined で、画面は図形で代用する。 */
export const tarotBack = optional('tarot-back.webp');

export const harbor = find(artFiles, 'harbor.webp');
export const seal = find(artFiles, 'app-icon.png');
export const godSheets = ['winter', 'spring', 'summer', 'autumn', 'origin'].map(name => find(deityFiles, 'sheet-' + name + '.webp'));
export const residentArt = Array.from({ length: 16 }, (_, i) => find(artFiles, 'resident-' + String(i + 1).padStart(2, '0') + '.webp'));
export const currents = Array.from({ length: 12 }, (_, i) => find(artFiles, 'current-' + String(i + 1).padStart(2, '0') + '.webp'));
export const stages = Array.from({ length: 12 }, (_, i) => find(artFiles, 'stage-' + String(i + 1).padStart(2, '0') + '.webp'));
export const scenes = Array.from({ length: 8 }, (_, i) => find(artFiles, 'scene-' + String(i + 1).padStart(2, '0') + '.webp'));
