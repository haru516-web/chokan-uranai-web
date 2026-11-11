import { useEffect, useRef, useState } from 'react';
import { GodAnimation } from './GodAnimation';

// 神様が画面全体を気ままに漂う。占い結果が出るときは、画面の真ん中から覗き込み、ゆらゆら離れて漂いはじめる。
type Signal = 'peek' | 'jump';
const listeners = new Set<(signal: Signal) => void>();
/** 画面の真ん中から覗く登場（'peek'）や、確定の立ちジャンプ（'jump'）を神様に伝える。 */
export const callGod = (signal: Signal) => listeners.forEach(listener => listener(signal));

const SIZE = 78;
const PEEK_MS = 2300;

export function WanderingGod({ index }: { index: number }) {
  const [phase, setPhase] = useState<'wander' | 'peek'>('wander');
  const [pos, setPos] = useState(() => ({ x: -SIZE, y: 120 }));   // 最初は画面の左外から入ってくる
  const [move, setMove] = useState({ ms: 0, face: 1 });
  const [jump, setJump] = useState(0);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const posRef = useRef(pos);
  posRef.current = pos;

  useEffect(() => {
    const onSignal = (signal: Signal) => {
      if (signal === 'jump') { setJump(value => value + 1); return; }
      const x = window.innerWidth / 2 - SIZE / 2;
      const y = window.innerHeight / 2 - SIZE / 2;
      setMove({ ms: 0, face: 1 });
      setPos({ x, y });
      setPhase('peek');
      window.setTimeout(() => setPhase('wander'), PEEK_MS);
    };
    listeners.add(onSignal);
    return () => { listeners.delete(onSignal); };
  }, []);

  // 気ままに次の行き先を決めて、ゆっくり移動する。
  useEffect(() => {
    if (phase !== 'wander') return;
    let timer = 0;
    const next = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const x = 8 + Math.random() * Math.max(1, width - SIZE - 16);
      const y = 72 + Math.random() * Math.max(1, height - SIZE - 90);
      const ms = 4200 + Math.random() * 4200;
      setMove({ ms, face: x < posRef.current.x ? -1 : 1 });
      setPos({ x, y });
      timer = window.setTimeout(next, ms + Math.random() * 1500);
    };
    timer = window.setTimeout(next, 400);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const peeking = phase === 'peek';
  return <div aria-hidden="true" style={{
    position: 'fixed', left: 0, top: 0, width: SIZE, zIndex: 900, pointerEvents: 'none',
    transform: `translate(${pos.x}px, ${pos.y}px)`, transition: peeking || move.ms === 0 ? 'none' : `transform ${move.ms}ms ease-in-out`,
  }}>
    <div key={peeking ? 'peek' : 'wander'} {...(peeking ? { 'data-fx': 'peek' } : {})}>
      <div style={{ transform: `scaleX(${move.face})`, transition: 'transform .6s ease' }}>
        <div data-fx="float">
          <div key={jump} {...(jump ? { 'data-fx': 'jump' } : {})}>
            <GodAnimation forcePlay index={index} style={{ width: SIZE }} />
          </div>
        </div>
      </div>
    </div>
  </div>;
}
