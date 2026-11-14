import { useState } from 'react';
import { useStore } from '../../store/useStore';

/** "Add habit" form (name + monthly goal). */
interface Props {
  namePh: string;
  goalPh: string;
  goalWidth: number;
  /** Stretch the name field (habits view) or keep it natural (table view). */
  wide?: boolean;
}

export function AddHabit({ namePh, goalPh, goalWidth, wide }: Props) {
  const addHabit = useStore((s) => s.addHabit);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const submit = () => {
    const nm = name.trim();
    if (!nm) return;
    addHabit(nm, +goal || 20);
    setName('');
    setGoal('');
  };
  return (
    <form
      className="add"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <input placeholder={namePh} maxLength={40} value={name} onChange={(e) => setName(e.target.value)} style={wide ? { flex: 1, minWidth: 140 } : undefined} />
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={31}
        placeholder={goalPh}
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        style={{ width: goalWidth }}
      />
      <button type="submit">Добавить</button>
    </form>
  );
}
