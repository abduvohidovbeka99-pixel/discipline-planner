import { useRef, useState } from 'react';
import { getData, useStore } from '../../store/useStore';
import { downloadBackup, parseBackup, summarize, type ImportSummary } from '../../store/backup';
import { SCHEMA_VERSION, STORAGE_KEY } from '../../store/migrations';
import type { AppData } from '../../store/types';
import './settings.css';

type Pending = { data: AppData; summary: ImportSummary; source: string };

function Summary({ s }: { s: ImportSummary }) {
  return (
    <ul className="imp-sum">
      <li>Привычек: {s.habits}</li>
      <li>
        Месяцев с отметками: {s.months} (отметок: {s.marks})
      </li>
      <li>Прочитано книг: {s.books}</li>
      <li>Отмеченных подходов: {s.sets}</li>
      <li>Записей веса: {s.weights}</li>
      <li>Дней креатина: {s.creatine}</li>
    </ul>
  );
}

export default function SettingsScreen() {
  const replaceAll = useStore((s) => s.replaceAll);
  const current = summarize(useStore());
  const file = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');
  const [paste, setPaste] = useState('');
  const [showPaste, setShowPaste] = useState(false);

  const load = (text: string, source: string) => {
    setDone('');
    try {
      const data = parseBackup(text);
      setPending({ data, summary: summarize(data), source });
      setError('');
    } catch (e) {
      setPending(null);
      setError((e as Error).message);
    }
  };

  return (
    <>
      <div className="card">
        <h2>Резервная копия</h2>
        <p className="set-p">
          Все данные хранятся только на этом устройстве. Сохрани файл, чтобы перенести отметки на другой телефон или в новую версию приложения. Файл
          совместим со старой HTML-версией ежедневника.
        </p>
        <Summary s={current} />
        <div className="set-row">
          <button type="button" className="pbtn" onClick={() => downloadBackup(getData())}>
            Экспорт данных
          </button>
          <button type="button" className="nav" onClick={() => file.current?.click()}>
            Импорт из файла
          </button>
          <button type="button" className="nav" onClick={() => setShowPaste((v) => !v)}>
            Вставить текст
          </button>
          <input
            ref={file}
            type="file"
            accept="application/json,.json,text/plain"
            hidden
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = '';
              if (f) load(await f.text(), f.name);
            }}
          />
        </div>

        {showPaste && (
          <div className="set-paste">
            <textarea
              className="nin"
              rows={5}
              placeholder="Вставь сюда содержимое файла резервной копии (JSON)"
              value={paste}
              onChange={(e) => setPaste(e.target.value)}
            />
            <button type="button" className="nav" disabled={!paste.trim()} onClick={() => load(paste, 'вставленный текст')}>
              Проверить
            </button>
          </div>
        )}

        {error && <div className="hint" style={{ color: 'var(--warn)' }}>{error}</div>}
        {done && <div className="hint" style={{ color: 'var(--acc)' }}>{done}</div>}
      </div>

      {pending && (
        <div className="card imp">
          <h2>Импорт: {pending.source}</h2>
          <p className="set-p">В файле найдено:</p>
          <Summary s={pending.summary} />
          <p className="set-p">
            <b>Текущие данные будут заменены.</b> Если сомневаешься — сначала сделай экспорт.
          </p>
          <div className="set-row">
            <button
              type="button"
              className="pbtn"
              onClick={() => {
                replaceAll(pending.data);
                setPending(null);
                setPaste('');
                setShowPaste(false);
                setDone('Данные импортированы ✓');
              }}
            >
              Заменить данные
            </button>
            <button type="button" className="nav" onClick={() => setPending(null)}>
              Отмена
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <h2>О приложении</h2>
        <p className="set-p">
          Ежедневник — дисциплина · версия {__APP_VERSION__}
          <span className="sub">
            Формат данных v{SCHEMA_VERSION} · ключ {STORAGE_KEY}
          </span>
        </p>
      </div>
    </>
  );
}
