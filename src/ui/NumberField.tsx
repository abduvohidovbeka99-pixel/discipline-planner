import { useEffect, useState, type CSSProperties } from 'react';

interface Props {
  value: number | '';
  /** Called with the raw text when the user commits (blur / Enter), like a native `change` event. */
  onCommit(raw: string): void;
  className?: string;
  style?: CSSProperties;
  min?: number;
  max?: number;
  step?: number | string;
  placeholder?: string;
  'aria-label'?: string;
}

/**
 * Numeric input that commits on blur/Enter (the prototype used `change`
 * events), so typing "1" on the way to "15" does not immediately rescale
 * everything.
 */
export function NumberField({ value, onCommit, ...rest }: Props) {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);
  return (
    <input
      type="number"
      inputMode="decimal"
      {...rest}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => {
        if (text !== String(value)) onCommit(text);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
      }}
    />
  );
}
