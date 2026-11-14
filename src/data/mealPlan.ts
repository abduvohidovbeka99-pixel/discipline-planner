export interface Meal {
  name: string;
  emoji: string;
  time: string;
  /** [foodId, grams] at the base plan. */
  items: [string, number][];
}

/** Base meal plan; it is scaled to the chosen daily calories. */
export const MEAL_PLAN: Meal[] = [
  { name: 'Завтрак', emoji: '🍳', time: '08:00', items: [['oat', 80], ['mlk', 250], ['ban', 120], ['egg', 150], ['wal', 15]] },
  { name: 'Обед', emoji: '🍲', time: '13:00', items: [['chk', 180], ['rice', 120], ['bro', 150], ['oil', 10]] },
  { name: 'Ужин', emoji: '🌙', time: '19:00', items: [['bef', 150], ['buck', 100], ['bro', 100], ['oil', 10]] },
  { name: 'Перекусы', emoji: '🥜', time: 'между приёмами', items: [['cot', 200], ['app', 150], ['ppb', 20]] },
];

export const CALORIE_PRESETS = [2400, 2700, 3000, 3300];
