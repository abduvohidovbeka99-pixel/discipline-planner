import { QUOTE_CATEGORIES, QUOTES, type QuoteCategory } from '../../data/quotes';
import { useUi } from '../../store/uiStore';
import { Tiles } from '../../ui/Tiles';
import { GLYPHS, type GlyphName } from '../../ui/Icons';
import './quotes.css';

const CAT_GLYPH: Record<QuoteCategory, GlyphName> = {
  Все: 'star',
  'Успешные люди': 'crown',
  Политики: 'flag',
  Философы: 'column',
  Воины: 'sword',
};

const listFor = (c: QuoteCategory) => (c === 'Все' ? QUOTES : QUOTES.filter((q) => q.cat === c));

export default function QuotesScreen() {
  const { quoteCat, quoteIdx, set } = useUi();
  const list = listFor(quoteCat);
  const i = quoteIdx % list.length;
  const q = list[i];

  return (
    <>
      <Tiles
        items={QUOTE_CATEGORIES.map((c) => ({ key: c, label: c, icon: GLYPHS[CAT_GLYPH[c]] }))}
        value={quoteCat}
        onChange={(c) => set({ quoteCat: c, quoteIdx: Math.floor(Math.random() * listFor(c).length) })}
      />
      <button type="button" className="qcard" onClick={() => set({ quoteIdx: i + 1 })} aria-label="Следующая цитата">
        <div className="qt">«{q.text}»</div>
        <div className="qa">
          — {q.author} · {q.cat}
        </div>
      </button>
      <div className="hint">
        Нажми на карточку — появится следующая цитата ({i + 1} из {list.length}). Цитаты в вольном переводе, часть атрибуций традиционная.
      </div>
    </>
  );
}
