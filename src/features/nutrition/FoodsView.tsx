import { FOOD_CATEGORIES, FOODS, type FoodCategory } from '../../data/foods';
import { useUi } from '../../store/uiStore';
import { rn } from '../../lib/format';
import { Tiles } from '../../ui/Tiles';
import { GLYPHS, type GlyphName } from '../../ui/Icons';
import { NumberField } from '../../ui/NumberField';

const CAT_GLYPH: Record<FoodCategory, GlyphName> = {
  Все: 'all',
  Белок: 'egg',
  Углеводы: 'wheat',
  'Фрукты и овощи': 'apple',
  'Орехи и жиры': 'nut',
};

export function FoodsView() {
  const { portion, foodCat, set } = useUi();
  const q = portion / 100;
  return (
    <div className="card">
      <h2>Продукты для набора массы</h2>
      <div className="ctl" style={{ marginTop: 0 }}>
        <span>Порция, г:</span>
        <NumberField
          className="g"
          style={{ width: 84 }}
          min={1}
          max={2000}
          value={portion}
          onCommit={(v) => set({ portion: Math.max(1, Math.min(2000, parseFloat(v.replace(',', '.')) || 100)) })}
          aria-label="Порция, г"
        />
      </div>
      <div className="hint" style={{ margin: '0 0 10px' }}>
        Крупы и макароны — в сухом виде, мясо и рыба — в сыром. Значения ориентировочные.
      </div>
      <Tiles
        items={FOOD_CATEGORIES.map((c) => ({ key: c, label: c, icon: GLYPHS[CAT_GLYPH[c]] }))}
        value={foodCat}
        onChange={(c) => set({ foodCat: c })}
      />
      {FOODS.filter((f) => foodCat === 'Все' || f.cat === foodCat).map((f) => (
        <div className="fr" key={f.id}>
          <span className="fe">{f.emoji}</span>
          <div className="fi">
            <b>{f.name}</b>
            <small>
              Б {rn(f.p * q)} · Ж {rn(f.f * q)} · У {rn(f.c * q)}
            </small>
            <small>{f.note}</small>
          </div>
          <div className="fk">
            <b>{Math.round(f.kcal * q)}</b>
            <small>ккал{portion === 100 ? ' / 100 г' : ' / ' + portion + ' г'}</small>
          </div>
        </div>
      ))}
    </div>
  );
}
