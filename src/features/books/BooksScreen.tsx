import { BOOK_SECTIONS, BOOKS } from '../../data/books';
import { useStore } from '../../store/useStore';
import { BarRow } from '../../ui/Bar';
import './books.css';

export default function BooksScreen() {
  const read = useStore((s) => s.books);
  const toggle = useStore((s) => s.toggleBook);
  return (
    <div className="bks">
      {BOOK_SECTIONS.map((sec) => {
        const list = BOOKS.filter((b) => b.list === sec.list);
        const r = list.filter((b) => read[b.id]).length;
        return (
          <div className="card" key={sec.list}>
            <h2>{sec.title}</h2>
            <div className="hint" style={{ margin: '-4px 0 8px' }}>
              {sec.subtitle}
            </div>
            <BarRow pct={Math.round((r / list.length) * 100)} label={r + '/' + list.length} />
            {list.map((b) => (
              <button key={b.id} type="button" className={'bk' + (read[b.id] ? ' on' : '')} onClick={() => toggle(b.id)} aria-pressed={!!read[b.id]}>
                <div className="cb">{read[b.id] ? '✓' : ''}</div>
                <div>
                  <b>{b.title}</b>
                  <small>{b.author}</small>
                  <small>{b.note}</small>
                </div>
              </button>
            ))}
          </div>
        );
      })}
    </div>
  );
}
