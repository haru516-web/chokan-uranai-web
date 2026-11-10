const artFiles = import.meta.glob('../assets/art/*', { eager: true, import: 'default', query: '?url' }) as Record<string, string>;
const deityFiles = import.meta.glob('../img/*', { eager: true, import: 'default', query: '?url' }) as Record<string, string>;

function find(files: Record<string, string>, name: string) {
  const entry = Object.entries(files).find(([path]) => path.endsWith('/' + name));
  if (!entry) throw new Error('Missing web asset: ' + name);
  return entry[1];
}

export const harbor = find(artFiles, 'harbor.webp');
export const seal = find(artFiles, 'app-icon.png');
export const godSheets = ['winter', 'spring', 'summer', 'autumn', 'origin'].map(name => find(deityFiles, 'sheet-' + name + '.webp'));
export const residentArt = Array.from({ length: 16 }, (_, i) => find(artFiles, 'resident-' + String(i + 1).padStart(2, '0') + '.webp'));
export const currents = Array.from({ length: 12 }, (_, i) => find(artFiles, 'current-' + String(i + 1).padStart(2, '0') + '.webp'));
export const stages = Array.from({ length: 12 }, (_, i) => find(artFiles, 'stage-' + String(i + 1).padStart(2, '0') + '.webp'));
export const scenes = Array.from({ length: 8 }, (_, i) => find(artFiles, 'scene-' + String(i + 1).padStart(2, '0') + '.webp'));
