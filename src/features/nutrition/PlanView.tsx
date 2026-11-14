import { useStore } from '../../store/useStore';
import { useUi } from '../../store/uiStore';
import { useToday } from '../../app/today';
import { CALORIE_PRESETS } from '../../data/mealPlan';
import { caloriePresets, gainForecast, recommendedKcal, scalePlan, weeksToGain } from '../../lib/calc';
import { addWeeks } from '../../lib/dates';
import { rn } from '../../lib/format';
import { Tile } from '../../ui/Tiles';
import { GLYPHS } from '../../ui/Icons';
import { NumberField } from '../../ui/NumberField';

function ForecastRow({ icon, title, kg, rate, from }: { icon: string; title: string; kg: number; rate: number; from: Date }) {
  return (
    <div className="fr">
      <span className="fe">{icon}</span>
      <div className="fi">
        <b>{title}</b>
        <small>≈ {addWeeks(kg / rate, from)}</small>
      </div>
      <div className="fk">
        <b>{weeksToGain(kg, rate)}</b>
        <small>нед.</small>
      </div>
    </div>
  );
}

export function PlanView() {
  const t = useToday();
  const nut = useStore((s) => s.nut);
  const setCalories = useStore((s) => s.setCalories);
  const setUi = useUi((s) => s.set);

  const T = nut.tk;
  const wt = nut.w.length ? nut.w[nut.w.length - 1].v : 0;
  const rec = recommendedKcal(wt);
  const plan = scalePlan(T);
  const presets = caloriePresets(CALORIE_PRESETS, rec);

  return (
    <>
      <div className="card">
        <h2>План питания на набор массы</h2>
        <div className="tiles">
          {presets.map((v, i) => (
            <Tile key={v} color={i} active={T === v} icon={GLYPHS.flame} label={v + (v === rec ? ' ★' : '')} onClick={() => setCalories(v)} />
          ))}
        </div>
        <div className="ctl" style={{ marginTop: 0 }}>
          <span>Своя калорийность:</span>
          <NumberField
            className="g"
            style={{ width: 84 }}
            min={1200}
            max={6000}
            step={50}
            value={T}
            onCommit={(v) => setCalories(Math.max(1200, Math.min(6000, Math.round(parseFloat(v.replace(',', '.'))) || 2700)))}
            aria-label="Своя калорийность"
          />
          <span>ккал</span>
        </div>
        {rec > 0 && (
          <div className="hint" style={{ margin: '0 0 10px' }}>
            ★ ≈ {rec} ккал для твоего веса {rn(wt)} кг (поддержание ≈ вес × 33 плюс 400 ккал).
          </div>
        )}
        <div className="stats">
          <div>
            <b>{Math.round(plan.kcal)}</b>
            <small>ккал в день</small>
          </div>
          <div>
            <b>{Math.round(plan.p)} г</b>
            <small>белок{wt ? ' · ' + rn(plan.p / wt) + ' г/кг' : ''}</small>
          </div>
          <div>
            <b>
              {Math.round(plan.f)} / {Math.round(plan.c)}
            </b>
            <small>жиры / углеводы, г</small>
          </div>
        </div>
        <div className="hint">Для набора мышц обычно хватает 1,6–2,2 г белка на кг веса. Граммы указаны для сухих круп и сырого мяса.</div>
      </div>

      {plan.meals.map((x) => (
        <div className="card" key={x.meal.name}>
          <div className="hh">
            <div>
              <b>
                {x.meal.emoji} {x.meal.name}
              </b>
              <span className="sub">{x.meal.time}</span>
            </div>
            <div className="pcb" style={{ fontSize: 20 }}>
              {Math.round(x.kcal)} ккал
            </div>
          </div>
          {x.items.map((i) => (
            <div className="fr" key={i.food.id}>
              <span className="fe">{i.food.emoji}</span>
              <div className="fi">
                <b>{i.food.name}</b>
              </div>
              <div className="fk">
                <b style={{ fontSize: 16 }}>{i.grams} г</b>
                <small>{Math.round(i.kcal)} ккал</small>
              </div>
            </div>
          ))}
          <div className="hint">
            Б {Math.round(x.p)} · Ж {Math.round(x.f)} · У {Math.round(x.c)}
          </div>
        </div>
      ))}

      {!wt ? (
        <div className="card">
          <h2>За сколько наберу</h2>
          <p>Добавь текущий вес — и я посчитаю прогноз набора.</p>
          <button type="button" className="pbtn" onClick={() => setUi({ nutView: 'w' })}>
            Ввести вес
          </button>
        </div>
      ) : (
        <Forecast T={T} wt={wt} goal={nut.g} from={t.date} />
      )}
    </>
  );
}

function Forecast({ T, wt, goal, from }: { T: number; wt: number; goal: number; from: Date }) {
  const { maintenance, surplus, rate } = gainForecast(T, wt);
  const need = goal > wt ? goal - wt : 0;
  return (
    <div className="card">
      <h2>За сколько наберу</h2>
      {rate <= 0 ? (
        <p>При {T} ккал профицита почти нет — вес не будет расти. Подними калорийность плана.</p>
      ) : (
        <>
          <p>
            Поддержание ≈ <b>{maintenance}</b> ккал (вес × 33). План даёт профицит ≈ <b>{surplus}</b> ккал в день — это примерно{' '}
            <b>{rate.toFixed(2)} кг в неделю</b>.
          </p>
          {need > 0 && <ForecastRow icon="🎯" title={`До цели ${rn(goal)} кг: +${rn(need)} кг`} kg={need} rate={rate} from={from} />}
          {[1, 2, 3, 5].map((x) => (
            <ForecastRow key={x} icon={'+' + x} title={`+${x} кг (до ${rn(wt + x)} кг)`} kg={x} rate={rate} from={from} />
          ))}
        </>
      )}
      <div className="hint">
        Оценка грубая: часть прироста в начале — вода и гликоген, а реальный темп зависит от тренировок, сна и генетики. Если вес растёт быстрее ~0,5 кг в неделю,
        больше прибавки уйдёт в жир — тогда снизь калорийность.
      </div>
    </div>
  );
}
