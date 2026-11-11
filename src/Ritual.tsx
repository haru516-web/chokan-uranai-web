// 鑑定の儀式。入力の直後、何を読んでいるのかを一つずつ見せてから結果をひらく。タップで飛ばせる。
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ritualBg } from './art';
import type { Profile } from './domain';
import { GodAnimation } from './GodAnimation';
import { ctxFor, SEASON, STAGES } from './scoring';

const STEP_MS = 850;

export function Ritual({ profile, today, onDone }: { profile: Profile; today: Date; onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const c = ctxFor(today);
  const season = SEASON[profile.t.mod];
  const steps = [
    { label: '生まれた日の海をひらく', value: `${profile.Y}年${profile.M}月${profile.D}日`, result: season.n + 'の海' },
    { label: '名前の画数を数える', value: profile.name, result: profile.total + '画' },
    { label: '今日の月を読む', value: `${c.MO}月${c.DA}日`, result: c.moon + '・' + c.phaseTide },
    { label: '三つの潮を重ねる', value: c.yearPillar + '年・' + c.solarMonthTerm, result: STAGES[c.stage].n },
  ];

  useEffect(() => {
    if (leaving) { const timer = setTimeout(onDone, 520); return () => clearTimeout(timer); }
    if (step >= steps.length) { const timer = setTimeout(() => setLeaving(true), 350); return () => clearTimeout(timer); }
    const timer = setTimeout(() => setStep(value => value + 1), STEP_MS);
    return () => clearTimeout(timer);
  }, [step, leaving, onDone, steps.length]);

  return createPortal(<div className="ritual" data-leaving={leaving} style={{ '--tint': season.col, ...(ritualBg ? { backgroundImage: `linear-gradient(rgba(7,10,21,.55), rgba(7,10,21,.82)), url(${ritualBg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}) } as React.CSSProperties}
    role="status" aria-live="polite" onClick={() => setLeaving(true)}>
    <div className="ritual-stars" aria-hidden="true">{Array.from({ length: 26 }, (_, i) => <i key={i} style={{
      left: (i * 37 + 11) % 100 + '%', top: (i * 53 + 7) % 100 + '%', animationDelay: (i % 9) * 0.27 + 's', fontSize: 8 + (i % 4) * 4,
    }}>✦</i>)}</div>
    <div className="ritual-core" aria-hidden="true">
      <svg viewBox="0 0 200 200" className="ritual-ring ritual-ring-a">
        <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 7" />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1="100" y1="6" x2="100" y2={i % 3 ? 14 : 22} stroke="currentColor" strokeWidth={i % 3 ? 1 : 2} transform={`rotate(${i * 30} 100 100)`} />)}
      </svg>
      <svg viewBox="0 0 200 200" className="ritual-ring ritual-ring-b">
        <circle cx="100" cy="100" r="74" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="28 10" />
        {Array.from({ length: 24 }, (_, i) => <circle key={i} cx="100" cy="30" r={i % 2 ? 1.2 : 2.2} fill="currentColor" transform={`rotate(${i * 15} 100 100)`} />)}
      </svg>
      <svg viewBox="0 0 200 200" className="ritual-ring ritual-ring-c">
        <path d="M100 48 A52 52 0 1 1 99.9 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          strokeDasharray="327" strokeDashoffset={327 - 327 * Math.min(step, steps.length) / steps.length} style={{ transition: 'stroke-dashoffset .8s cubic-bezier(.2,.8,.2,1)' }} />
      </svg>
      <div className="ritual-god"><GodAnimation forcePlay index={step >= 1 ? profile.t.mod : 4} style={{ width: 96 }} /></div>
    </div>
    <ol className="ritual-steps">
      {steps.map((item, index) => <li key={item.label} data-state={index < step ? 'done' : index === step ? 'now' : 'wait'}>
        <span className="ritual-dot" aria-hidden="true">{index < step ? '✓' : '◇'}</span>
        <span className="ritual-label">{item.label}<small>{item.value}</small></span>
        <b className="ritual-result">{index < step ? item.result : '…'}</b>
      </li>)}
    </ol>
    <p className="ritual-skip">タップで結果へ</p>
  </div>, document.body);
}
