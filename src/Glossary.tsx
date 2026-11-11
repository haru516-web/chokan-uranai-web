// 用語ポップ。本文中の用語（点線の下線）をタップすると、下からカードがせり上がって説明する。
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Text, type StyleProp, type TextStyle } from 'react-native';
import { aliases, glossary, type Term } from './terms';

export type SheetRow = { mark: string; label: string; text: string; color?: string };
export type Sheet = Term & { rows?: SheetRow[]; color?: string };

const Ctx = createContext<(sheet: Sheet | string) => void>(() => {});
/** 用語ID（glossary のキー）か、その場で組み立てた内容を渡すとポップが開く。 */
export const useGloss = () => useContext(Ctx);

export function GlossProvider({ children }: { children: ReactNode }) {
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [closing, setClosing] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);
  const open = useCallback((next: Sheet | string) => {
    const value = typeof next === 'string' ? glossary[next] : next;
    if (value) { setClosing(false); setSheet(value); }
  }, []);
  const close = useCallback(() => {
    setClosing(true);
    setTimeout(() => { setSheet(null); setClosing(false); }, 220);
  }, []);

  useEffect(() => {
    if (!sheet) return;
    closeButton.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheet, close]);

  const color = sheet?.color ?? '#eacc8c';
  return <Ctx.Provider value={open}>
    {children}
    {sheet && createPortal(<div className="gloss-layer" data-closing={closing} style={{ '--gloss': color } as React.CSSProperties}>
      <button type="button" className="gloss-scrim" aria-label="説明を閉じる" onClick={close} />
      <div className="gloss-sheet" role="dialog" aria-modal="true" aria-label={sheet.title + 'の説明'}>
        <span className="gloss-grip" aria-hidden="true" />
        <div className="gloss-head">
          <span className="gloss-mark" aria-hidden="true"><span className="gloss-ring" /><b>{sheet.mark}</b></span>
          <div>
            <p className="gloss-kicker">{sheet.kicker}</p>
            <h2 className="gloss-title">{sheet.title}</h2>
          </div>
        </div>
        <p className="gloss-body">{sheet.body}</p>
        {sheet.rows && <ul className="gloss-rows">
          {sheet.rows.map((row, index) => <li key={row.label} style={{ animationDelay: 120 + index * 90 + 'ms', '--row': row.color ?? color } as React.CSSProperties}>
            <span className="gloss-row-mark">{row.mark}</span>
            <span><b>{row.label}</b>{row.text}</span>
          </li>)}
        </ul>}
        {sheet.more && <p className="gloss-more">{sheet.more}</p>}
        <button ref={closeButton} type="button" className="gloss-close" onClick={close}>とじる</button>
      </div>
    </div>, document.body)}
  </Ctx.Provider>;
}

const words = Object.keys(aliases).sort((a, b) => b.length - a.length);
const pattern = new RegExp('(' + words.join('|') + ')', 'g');
const termStyle = {
  textDecorationLine: 'underline', textDecorationStyle: 'dotted', textDecorationColor: '#eacc8c', cursor: 'help',
} as unknown as TextStyle;

/** 文章の中の用語を、タップで説明が出るリンクにする（同じ用語は最初の1回だけ）。 */
export function Gloss({ children, style, skip }: { children: string; style?: StyleProp<TextStyle>; skip?: string[] }) {
  const open = useGloss();
  const parts = useMemo(() => {
    const seen = new Set<string>(skip);
    return children.split(pattern).map(part => {
      const id = aliases[part];
      if (!id || seen.has(id)) return { text: part };
      seen.add(id);
      return { text: part, id };
    });
  }, [children, skip]);
  return <Text style={style}>
    {parts.map((part, index) => part.id
      ? <Text key={index} accessibilityRole="button" accessibilityLabel={part.text + 'の説明を開く'} onPress={() => open(part.id!)} style={termStyle}>{part.text}</Text>
      : part.text)}
  </Text>;
}

/** 用語ひとつを、タップできる言葉として置く。 */
export function TermText({ id, children, style }: { id: string; children?: string; style?: StyleProp<TextStyle> }) {
  const open = useGloss();
  return <Text accessibilityRole="button" accessibilityLabel={(children ?? id) + 'の説明を開く'} onPress={() => open(id)} style={[style, termStyle]}>{children ?? id}</Text>;
}
