import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent, MouseEvent, PointerEvent } from 'react';
import { GodAnimation } from './GodAnimation';
import { SEASON } from './scoring';

export const mainTabs = [
  { id: 'today', label: '今日', mark: '☾' },
  { id: 'self', label: '自分', mark: '◇' },
  { id: 'questions', label: '問い', mark: '◌' },
  { id: 'chart', label: '海図', mark: '◈' },
  { id: 'atlas', label: '図鑑', mark: '✦' },
  { id: 'journal', label: '航海帳', mark: '⌑' },
] as const;

export type MainTab = typeof mainTabs[number]['id'];

type Point = { x: number; y: number };
type Viewport = { width: number; height: number };

const PET_SIZE = 82;
const BUTTON_SIZE = 68;
const PET_MARGIN = PET_SIZE / 2 + 12;

function readViewport(): Viewport {
  return { width: window.innerWidth, height: window.innerHeight };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function clampPoint(point: Point, inset: number, viewport: Viewport): Point {
  const horizontalInset = Math.min(inset, viewport.width / 2);
  const verticalInset = Math.min(inset, viewport.height / 2);
  return {
    x: clamp(point.x, horizontalInset, viewport.width - horizontalInset),
    y: clamp(point.y, verticalInset, viewport.height - verticalInset),
  };
}

export function PetNavigation({ seasonIndex, activeTab, onSelect }: {
  seasonIndex: number | null;
  activeTab: MainTab;
  onSelect: (tab: MainTab) => void;
}) {
  const [viewport, setViewport] = useState<Viewport>(readViewport);
  const [position, setPosition] = useState<Point>(() => ({
    x: Math.max(PET_MARGIN, window.innerWidth - PET_MARGIN - 10),
    y: Math.max(PET_MARGIN, window.innerHeight - PET_MARGIN - 28),
  }));
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ pointerId: number; start: Point; origin: Point; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  const safeSeasonIndex = seasonIndex !== null && seasonIndex >= 0 && seasonIndex < SEASON.length ? seasonIndex : null;
  const petName = safeSeasonIndex === null ? 'はじまりの神' : SEASON[safeSeasonIndex].n + 'の神';
  const petTint = safeSeasonIndex === null ? '#eacc8c' : SEASON[safeSeasonIndex].col;
  const orbitRadius = Math.max(54, Math.min(98, (Math.min(viewport.width, viewport.height) - BUTTON_SIZE - 24) / 2 - 10));
  const orbitInset = orbitRadius + BUTTON_SIZE / 2 + 12;

  useEffect(() => {
    const update = () => setViewport(readViewport());
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    setPosition(point => clampPoint(point, open ? orbitInset : PET_MARGIN, viewport));
  }, [open, orbitInset, viewport]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      pointerId: event.pointerId,
      start: { x: event.clientX, y: event.clientY },
      origin: position,
      moved: false,
    };
    suppressClick.current = false;
  }

  function movePet(event: PointerEvent<HTMLDivElement>) {
    const activeDrag = drag.current;
    if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;
    const dx = event.clientX - activeDrag.start.x;
    const dy = event.clientY - activeDrag.start.y;
    if (!activeDrag.moved && Math.hypot(dx, dy) >= 5) {
      activeDrag.moved = true;
      setDragging(true);
      setOpen(false);
    }
    if (activeDrag.moved) {
      setPosition(clampPoint({ x: activeDrag.origin.x + dx, y: activeDrag.origin.y + dy }, PET_MARGIN, viewport));
    }
  }

  function finishDrag(event: PointerEvent<HTMLDivElement>) {
    if (drag.current?.pointerId !== event.pointerId) return;
    suppressClick.current = drag.current.moved;
    drag.current = null;
    setDragging(false);
  }

  function activatePet(event: MouseEvent<HTMLDivElement>) {
    if (suppressClick.current) {
      suppressClick.current = false;
      event.preventDefault();
      return;
    }
    setOpen(value => !value);
  }

  function handlePetKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setOpen(value => !value);
      return;
    }
    const directions: Record<string, Point> = {
      ArrowUp: { x: 0, y: -24 },
      ArrowDown: { x: 0, y: 24 },
      ArrowLeft: { x: -24, y: 0 },
      ArrowRight: { x: 24, y: 0 },
    };
    const delta = directions[event.key];
    if (delta) {
      event.preventDefault();
      setPosition(point => clampPoint({ x: point.x + delta.x, y: point.y + delta.y }, PET_MARGIN, viewport));
      setOpen(false);
    }
  }

  const anchorStyle = { left: position.x, top: position.y } as CSSProperties;
  return <div className="pet-navigation-layer" role="group" aria-label="潮環占いの画面メニュー">
    {open && <button type="button" className="pet-menu-scrim" aria-label="メニューを閉じる" onClick={() => setOpen(false)} />}
    {mainTabs.map((item, index) => {
      const angle = (-90 + index * 360 / mainTabs.length) * Math.PI / 180;
      const x = Math.cos(angle) * orbitRadius;
      const y = Math.sin(angle) * orbitRadius;
      const style = {
        left: position.x + x,
        top: position.y + y,
        '--pet-delay': `${index * 24}ms`,
        '--pet-tint': petTint,
      } as CSSProperties;
      return <button key={item.id} type="button" className="pet-orbit-button"
        style={style} data-open={open} data-active={activeTab === item.id}
        aria-label={`${item.label}を表示する`} aria-pressed={activeTab === item.id}
        tabIndex={open ? 0 : -1} aria-hidden={!open}
        onClick={event => { event.stopPropagation(); setOpen(false); onSelect(item.id); }}>
        <span className="pet-orbit-mark" aria-hidden="true">{item.mark}</span>
        <span className="pet-orbit-label">{item.label}</span>
      </button>;
    })}
    <div className="pet-main-button" role="button" tabIndex={0}
      style={{ ...anchorStyle, '--pet-tint': petTint } as CSSProperties}
      aria-label={`${petName}。タップで画面メニューを開閉、矢印キーまたはドラッグで移動。`}
      aria-expanded={open} aria-pressed={open}
      title="タップで画面メニュー、ドラッグで移動。矢印キーでも動かせます。"
      onPointerDown={startDrag} onPointerMove={movePet} onPointerUp={finishDrag} onPointerCancel={finishDrag}
      onClick={activatePet} onKeyDown={handlePetKey} data-dragging={dragging}>
      <span className="pet-aura" aria-hidden="true" />
      <span className="pet-sprite" aria-hidden="true"><GodAnimation index={safeSeasonIndex ?? 4} style={{ width: 60 }} /></span>
      <span className="pet-name" aria-hidden="true">{petName}</span>
    </div>
  </div>;
}
