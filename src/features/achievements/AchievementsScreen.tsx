import { useUi, type AchView } from '../../store/uiStore';
import { Tiles, type TileItem } from '../../ui/Tiles';
import { GLYPHS } from '../../ui/Icons';
import { RankView } from './RankView';
import { HabitAchievementsView } from './HabitAchievementsView';
import { MilestonesView } from './MilestonesView';
import './achievements.css';

const VIEWS: TileItem<AchView>[] = [
  { key: 'rank', label: 'Рейтинг', icon: GLYPHS.gem },
  { key: 'habits', label: 'Привычки', icon: GLYPHS.medal },
  { key: 'stages', label: 'Этапы', icon: GLYPHS.flag },
];

export default function AchievementsScreen() {
  const { achView, set } = useUi();
  return (
    <>
      <Tiles items={VIEWS} value={achView} onChange={(v) => set({ achView: v })} />
      {achView === 'rank' && <RankView />}
      {achView === 'habits' && <HabitAchievementsView />}
      {achView === 'stages' && <MilestonesView />}
    </>
  );
}
