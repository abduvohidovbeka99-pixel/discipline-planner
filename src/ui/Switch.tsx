interface Props {
  checked: boolean;
  onChange(v: boolean): void;
  label: string;
  hint?: string;
}

/** Labelled on/off switch row. */
export function Switch({ checked, onChange, label, hint }: Props) {
  return (
    <button type="button" role="switch" aria-checked={checked} className="sw-row" onClick={() => onChange(!checked)}>
      <span className="sw-txt">
        <b>{label}</b>
        {hint && <small>{hint}</small>}
      </span>
      <span className={'sw' + (checked ? ' on' : '')} aria-hidden="true">
        <i />
      </span>
    </button>
  );
}
