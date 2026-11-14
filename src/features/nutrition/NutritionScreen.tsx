import { useUi, type NutView } from '../../store/uiStore';
import { Tiles, type TileItem } from '../../ui/Tiles';
import { GLYPHS } from '../../ui/Icons';
import { FoodsView } from './FoodsView';
import { PlanView } from './PlanView';
import { CreatineView } from './CreatineView';
import { WeightView } from './WeightView';
import './nutrition.css';

const VIEWS: TileItem<NutView>[] = [
  { key: 'food', label: 'Продукты', icon: GLYPHS.apple },
  { key: 'plan', label: 'План', icon: GLYPHS.plan },
  { key: 'cr', label: 'Креатин', icon: GLYPHS.flask },
  { key: 'w', label: 'Вес', icon: GLYPHS.scale },
];

export default function NutritionScreen() {
  const { nutView, set } = useUi();
  return (
    <>
      <Tiles items={VIEWS} value={nutView} onChange={(v) => set({ nutView: v })} />
      {nutView === 'food' && <FoodsView />}
      {nutView === 'plan' && <PlanView />}
      {nutView === 'cr' && <CreatineView />}
      {nutView === 'w' && <WeightView />}
    </>
  );
}
