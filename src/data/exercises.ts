/**
 * Workout programs and stick-figure pose data (ported from the prototype's
 * `EX`, `FD`, `FX`, `MUS`, `EQ`).
 *
 * A figure is described by two (or three) key poses. Each pose maps joint
 * names to coordinates in a 240×170 viewBox:
 *   S shoulder · H hip · E elbow · W wrist · K knee · F foot · D head · P cable anchor
 * The animation goes A → (M) → B → (M) → A.
 */

export type Joint = 'S' | 'H' | 'E' | 'W' | 'K' | 'F' | 'D' | 'P';
export type Pt = readonly [number, number];
export type Pose = Partial<Record<Joint, Pt>>;

/** Highlighted (working) muscle: segment j→k from fraction `from` to `to`, stroke width. */
export type Glow = readonly [Joint, Joint, number, number, number];

/** Static equipment / floor shapes drawn behind the figure. */
export type EqShape =
  | { t: 'ellipse'; cx: number; cy: number; rx: number; ry: number; opacity: number }
  | { t: 'rect'; x: number; y: number; w: number; h: number; rx: number }
  | { t: 'path'; cls: 'eq' | 'bn'; d: string; sw?: number };

export interface FigureDef {
  A: Pose;
  B: Pose;
  /** Optional mid pose — enables the 5-keyframe "swing" animation. */
  M?: Pose;
  /** Offset of the far (shaded) arm. */
  fo: Pt;
  /** Offset of the far (shaded) leg. */
  fl: Pt;
  hl: Glow[];
  /** Glow opacity curve: c1 symmetric, c2 peaks late. */
  m: 'c1' | 'c2';
  /** Phase captions for the first and second half of the rep. */
  ph: [string, string];
  eq: EqShape[];
  /** Static far arm (S, E, W) — used when the far arm does not move. */
  fa?: [Pt, Pt, Pt];
  /** Extra animated segments, e.g. cables. */
  ex?: { cls: 'cb'; joints: Joint[] }[];
  /** Draw a weight in the near hand. */
  wt?: boolean;
  /** Draw a weight in the far hand. */
  fw?: boolean;
  /** Weight radius (default 8). */
  wr?: number;
  /** Scale the whole scene down (standing exercises). */
  sc?: boolean;
  /** Blur filter region for glows: 'tight' (legacy figures) or 'wide'. */
  glowRegion: 'tight' | 'wide';
  /** Lift the chin by this many degrees in the illustrated figure (e.g. looking up at the bar). */
  chinUp?: number;
  /**
   * Joints that move across the viewer (frontal plane: presses, pull-ups,
   * face pulls). Seen from the side they travel in a straight line with the
   * bone foreshortened, so they are interpolated linearly instead of rotated.
   */
  planar?: Joint[];
}

const mp = (b: Pose, o: Pose): Pose => ({ ...b, ...o });

// ---- equipment ----
const MAT: EqShape[] = [
  { t: 'ellipse', cx: 120, cy: 156, rx: 100, ry: 4, opacity: 0.1 },
  { t: 'rect', x: 10, y: 153, w: 220, h: 8, rx: 4 },
];
const MATV: EqShape[] = [
  { t: 'ellipse', cx: 120, cy: 196, rx: 170, ry: 5, opacity: 0.12 },
  { t: 'rect', x: -50, y: 192, w: 340, h: 12, rx: 6 },
];
const FLOOR_LOW: EqShape = { t: 'rect', x: 10, y: 160, w: 220, h: 6, rx: 3 };
const PULL_BAR: EqShape[] = [
  FLOOR_LOW,
  { t: 'path', cls: 'eq', d: 'M46 160V26M198 160V26' },
  { t: 'path', cls: 'eq', d: 'M46 26H198', sw: 7 },
];
const DIP_BARS: EqShape[] = [FLOOR_LOW, { t: 'path', cls: 'eq', d: 'M92 84H176M92 160V84M176 160V84' }];
const BENCH: EqShape[] = [
  { t: 'path', cls: 'bn', d: 'M44 109H146' },
  { t: 'path', cls: 'eq', d: 'M60 115V153M132 115V153' },
];

// ---- base poses ----
const LY: Pose = { S: [62, 93], H: [122, 93], K: [165, 104], F: [165, 148], D: [44, 91] };
const LI: Pose = { S: [76, 61], H: [122, 100], K: [165, 106], F: [165, 148], D: [62, 49] };
const ST: Pose = { S: [112, 40], H: [112, 100], K: [113, 144], F: [114, 188], D: [114, 22] };
const SE: Pose = { H: [100, 104], K: [144, 105], F: [146, 149] };
const PR: Pose = { S: [100, 46], H: [96, 104], K: [140, 106], F: [142, 149], D: [102, 28] };

export const FIGURES: Record<string, FigureDef> = {
  // ---- bodyweight (legacy FD) ----
  pushup: {
    A: { S: [184, 100], H: [125, 119], E: [186, 124], W: [188, 148], K: [82, 133], F: [40, 146], D: [200, 92] },
    B: { S: [186, 130], H: [124, 137], E: [164, 140], W: [188, 148], K: [80, 142], F: [38, 147], D: [203, 126] },
    fo: [-6, -3], fl: [4, -2], hl: [['S', 'H', 0, 0.4, 16], ['S', 'E', 0, 1, 10]], m: 'c2',
    ph: ['Вниз · вдох', 'Вверх · выдох'], eq: MAT, glowRegion: 'tight',
  },
  crunch: {
    A: { S: [62, 142], H: [130, 142], E: [72, 124], W: [50, 132], K: [165, 104], F: [190, 146], D: [46, 140] },
    B: { S: [78, 98], H: [130, 142], E: [88, 78], W: [62, 84], K: [165, 104], F: [190, 146], D: [64, 84] },
    fo: [-4, -3], fl: [-6, -2], hl: [['S', 'H', 0.35, 0.95, 16]], m: 'c1',
    ph: ['Подъём · выдох', 'Вниз · вдох'], eq: MAT, glowRegion: 'tight',
  },
  legraise: {
    A: { S: [54, 142], H: [120, 142], E: [78, 146], W: [102, 146], K: [160, 141], F: [200, 138], D: [40, 140] },
    B: { S: [54, 142], H: [120, 142], E: [78, 146], W: [102, 146], K: [124, 100], F: [130, 60], D: [40, 140] },
    fo: [-2, -3], fl: [6, -3], hl: [['S', 'H', 0.5, 1, 16], ['H', 'K', 0, 0.7, 12]], m: 'c1',
    ph: ['Ноги вверх · выдох', 'Вниз · вдох'], eq: MAT, glowRegion: 'tight',
  },
  plank: {
    A: { S: [170, 108], H: [112, 124], E: [170, 146], W: [200, 148], K: [71, 136], F: [30, 147], D: [188, 100] },
    B: { S: [170, 108], H: [112, 127], E: [170, 146], W: [200, 148], K: [71, 138], F: [30, 148], D: [188, 101] },
    fo: [-5, -2], fl: [4, -1], hl: [['S', 'H', 0.3, 1, 16]], m: 'c1',
    ph: ['Напряги кор', 'Дыши ровно'], eq: MAT, glowRegion: 'tight',
  },
  pullup: {
    A: { S: [122, 74], H: [122, 128], E: [122, 50], W: [122, 26], K: [124, 152], F: [104, 150], D: [126, 56] },
    B: { S: [120, 36], H: [120, 92], E: [106, 46], W: [122, 26], K: [122, 116], F: [102, 114], D: [124, 14] },
    fo: [-7, -1], fl: [5, -1], hl: [['S', 'H', 0, 0.55, 16], ['S', 'E', 0, 1, 10]], m: 'c1',
    ph: ['Вверх · выдох', 'Вниз · вдох'], eq: PULL_BAR, glowRegion: 'tight', planar: ['E', 'W'], chinUp: 35,
  },
  dips: {
    A: { S: [130, 40], H: [124, 94], E: [129, 62], W: [130, 84], K: [120, 122], F: [100, 124], D: [135, 24] },
    B: { S: [132, 64], H: [126, 118], E: [112, 72], W: [130, 84], K: [122, 144], F: [102, 146], D: [138, 48] },
    fo: [-6, -2], fl: [4, -1], hl: [['S', 'E', 0, 1, 10], ['S', 'H', 0, 0.4, 16]], m: 'c2',
    ph: ['Вниз · вдох', 'Вверх · выдох'], eq: DIP_BARS, glowRegion: 'tight',
  },

  // ---- weights (legacy FX) ----
  cp: {
    // Dumbbells lower to mid-chest, elbows drop below the torso line.
    A: mp(LY, { E: [66, 69], W: [68, 45] }), B: mp(LY, { E: [70, 100], W: [74, 72] }),
    hl: [['S', 'H', 0, 0.4, 16], ['S', 'E', 0, 1, 9]], m: 'c2', ph: ['Вниз · вдох', 'Жми вверх · выдох'],
    eq: [...MAT, ...BENCH], wt: true, fw: true, fo: [-4, -3], fl: [5, -1], glowRegion: 'wide', planar: ['E'],
  },
  ci: {
    // Dumbbells lower to the upper chest (not the face).
    A: mp(LI, { E: [84, 37], W: [88, 13] }), B: mp(LI, { E: [86, 80], W: [96, 54] }),
    hl: [['S', 'H', 0, 0.4, 16], ['S', 'E', 0, 1, 9]], m: 'c2', ph: ['Вниз · вдох', 'Жми вверх · выдох'],
    eq: [...MAT, { t: 'path', cls: 'bn', d: 'M118 110L66 66M116 110H150' }, { t: 'path', cls: 'eq', d: 'M136 116V153M88 90L76 153' }],
    wt: true, fw: true, fo: [-4, -3], fl: [5, -1], glowRegion: 'wide', planar: ['E'],
  },
  cpo: {
    A: mp(LY, { E: [65, 70], W: [62, 47] }), B: mp(LY, { E: [41, 81], W: [19, 69] }),
    hl: [['S', 'H', 0, 0.45, 16], ['S', 'E', 0, 1, 9]], m: 'c2', ph: ['Назад за голову · вдох', 'Над грудью · выдох'],
    eq: [...MAT, ...BENCH], wt: true, fo: [-3, -3], fl: [5, -1], glowRegion: 'wide',
  },
  bc: {
    A: mp(ST, { E: [112, 64], W: [112, 88] }), M: mp(ST, { E: [114, 64], W: [138, 66] }), B: mp(ST, { E: [114, 64], W: [130, 45] }),
    hl: [['S', 'E', 0.1, 0.95, 11]], m: 'c1', ph: ['Вверх · выдох', 'Вниз · вдох'],
    eq: MATV, sc: true, wt: true, fw: true, fo: [-7, 0], fl: [6, 0], glowRegion: 'wide',
  },
  bco: {
    A: { ...SE, S: [149, 70], D: [164, 60], E: [150, 95], W: [150, 119] },
    M: { ...SE, S: [149, 70], D: [164, 60], E: [150, 95], W: [174, 96] },
    B: { ...SE, S: [149, 70], D: [164, 60], E: [150, 95], W: [165, 76] },
    fa: [[149, 70], [138, 90], [128, 100]],
    hl: [['S', 'E', 0.05, 0.95, 11]], m: 'c1', ph: ['Вверх · выдох', 'Вниз · вдох'],
    eq: [...MAT, { t: 'path', cls: 'bn', d: 'M84 117H150' }, { t: 'path', cls: 'eq', d: 'M96 123V153M138 123V153' }],
    wt: true, fo: [-5, -1], fl: [4, 0], glowRegion: 'wide',
  },
  bpr: {
    A: mp(PR, { E: [112, 67], W: [124, 88] }), M: mp(PR, { E: [112, 67], W: [136, 64] }), B: mp(PR, { E: [112, 67], W: [116, 44] }),
    hl: [['S', 'E', 0.05, 0.95, 11]], m: 'c1', ph: ['Вверх · выдох', 'Вниз · вдох'],
    eq: [...MAT, { t: 'path', cls: 'bn', d: 'M74 117H124M114 52L148 110' }, { t: 'path', cls: 'eq', d: 'M86 123V153M148 116V153' }],
    wt: true, fw: true, fo: [-5, -1], fl: [4, 0], glowRegion: 'wide',
  },
  sp: {
    A: mp(ST, { E: [120, 58], W: [118, 34] }), B: mp(ST, { E: [116, 18], W: [115, -6] }),
    hl: [['S', 'E', 0, 0.55, 15]], m: 'c1', ph: ['Жми вверх · выдох', 'Вниз · вдох'],
    eq: MATV, sc: true, wt: true, fw: true, fo: [-6, 0], fl: [6, 0], glowRegion: 'wide', planar: ['E'],
  },
  sfr: {
    A: mp(ST, { E: [112, 64], W: [112, 88] }), M: mp(ST, { E: [129, 57], W: [146, 74] }), B: mp(ST, { E: [136, 41], W: [160, 42] }),
    hl: [['S', 'E', 0, 0.6, 14]], m: 'c1', ph: ['Вверх · выдох', 'Вниз · вдох'],
    eq: MATV, sc: true, wt: true, fw: true, fo: [-7, 0], fl: [6, 0], glowRegion: 'wide',
  },
  sfp: {
    A: mp(ST, { E: [136, 41], W: [160, 42], P: [214, 36] }),
    M: mp(ST, { E: [128, 44], W: [144, 40], P: [214, 36] }),
    B: mp(ST, { E: [120, 48], W: [128, 37], P: [214, 36] }),
    ex: [{ cls: 'cb', joints: ['P', 'W'] }],
    hl: [['S', 'H', 0, 0.3, 14], ['S', 'E', 0, 0.5, 13]], m: 'c1', ph: ['Тяни к лицу · выдох', 'Назад · вдох'],
    eq: [...MATV, { t: 'path', cls: 'eq', d: 'M214 192V30' }], sc: true, wt: true, wr: 6, fo: [-6, 0], fl: [6, 0], glowRegion: 'wide', planar: ['E', 'W'],
  },
  tsk: {
    A: mp(LY, { E: [62, 69], W: [62, 45] }), M: mp(LY, { E: [62, 69], W: [39, 69] }), B: mp(LY, { E: [62, 69], W: [44, 81] }),
    hl: [['S', 'E', 0.1, 1, 11]], m: 'c2', ph: ['Вниз к голове · вдох', 'Разгибай · выдох'],
    eq: [...MAT, ...BENCH], wt: true, fo: [-3, -3], fl: [5, -1], glowRegion: 'wide',
  },
  toe: {
    A: mp(ST, { E: [116, 16], W: [116, -4] }), M: mp(ST, { E: [116, 16], W: [92, 16] }), B: mp(ST, { E: [116, 16], W: [98, 32] }),
    hl: [['S', 'E', 0.1, 1, 11]], m: 'c2', ph: ['Вниз за голову · вдох', 'Вверх · выдох'],
    eq: MATV, sc: true, wt: true, fo: [-4, 0], fl: [6, 0], glowRegion: 'wide',
  },
  tpd: {
    A: mp(ST, { E: [116, 64], W: [137, 52], P: [164, -4] }),
    M: mp(ST, { E: [116, 64], W: [140, 64], P: [164, -4] }),
    B: mp(ST, { E: [116, 64], W: [119, 88], P: [164, -4] }),
    ex: [{ cls: 'cb', joints: ['P', 'W'] }],
    hl: [['S', 'E', 0.1, 1, 11]], m: 'c1', ph: ['Вниз · выдох', 'Вверх · вдох'],
    eq: [...MATV, { t: 'path', cls: 'eq', d: 'M164 192V-4' }], sc: true, wt: true, wr: 6, fo: [-5, 0], fl: [6, 0], glowRegion: 'wide',
  },
};

/** [primary (highlighted) muscles, secondary muscles] */
export const MUSCLES: Record<string, [string[], string[]]> = {
  pushup: [['Грудь', 'Трицепсы'], ['Передние дельты', 'Кор']],
  crunch: [['Верх пресса'], ['Косые мышцы']],
  legraise: [['Нижний пресс'], ['Сгибатели бедра']],
  plank: [['Кор'], ['Плечи', 'Ягодицы']],
  pullup: [['Широчайшие', 'Бицепсы'], ['Трапеции', 'Предплечья']],
  dips: [['Трицепсы', 'Низ груди'], ['Передние дельты']],
  cp: [['Грудь', 'Трицепсы'], ['Передние дельты']],
  ci: [['Верх груди', 'Передние дельты'], ['Трицепсы']],
  cpo: [['Грудь', 'Широчайшие'], ['Трицепсы']],
  bc: [['Бицепсы'], ['Плечевая мышца', 'Предплечья']],
  bco: [['Бицепсы (пик)'], ['Плечевая мышца']],
  bpr: [['Бицепсы (низ)'], ['Плечевая мышца']],
  sp: [['Дельты', 'Трицепсы'], ['Трапеции', 'Кор']],
  sfr: [['Передние дельты'], ['Верх груди']],
  sfp: [['Задние дельты', 'Верх спины'], ['Трапеции', 'Ротаторы плеча']],
  tsk: [['Трицепсы'], ['Передние дельты']],
  toe: [['Трицепсы (длинная головка)'], ['Кор']],
  tpd: [['Трицепсы'], ['Кор']],
};

// ---- programs ----

/** Scaled reps: at least 1. */
export const rp = (v: number, k: number): number => Math.max(1, Math.round(v * k));

/** [figureKey, title, technique description] */
export type ExerciseFig = [string, string, string];

export interface Program {
  id: string;
  name: string;
  /** Name of the tracker habit that gets ticked when a set is marked. */
  habit: string;
  /** Sets per week. */
  per: number;
  figs: ExerciseFig[];
  /** Week parameters (meaning depends on `fmt`). */
  weeks: number[][];
  /** Figure used as the program's tile thumbnail. */
  thumb: string;
  fmt: (s: number[], k: number) => string;
}

const fm = (names: string[]) => (s: number[], k: number) =>
  names.map((t, i) => t + ' ' + s[2 * i] + '×' + rp(s[2 * i + 1], k)).join(' · ');

export const PROGRAMS: Program[] = [
  {
    id: 'pu', name: 'Отжимания', habit: '250 отжиманий', per: 6, thumb: 'pushup',
    figs: [['pushup', 'Отжимания', 'Корпус — прямая линия, локти под ~45°, грудь почти касается пола. Вниз — вдох, вверх — выдох. Подходы раскидай по дню.']],
    weeks: [[10, 15], [10, 18], [10, 20], [10, 25]],
    fmt: (s, k) => s[0] + ' подходов × ' + rp(s[1], k) + ' повт. = ' + s[0] * rp(s[1], k) + ' за день',
  },
  {
    id: 'abs', name: 'Пресс', habit: 'Пресс', per: 4, thumb: 'crunch',
    figs: [
      ['crunch', 'Скручивания', 'Поясница прижата к полу, шею не тянем — поднимаем лопатки, на выдохе сжимаем пресс.'],
      ['legraise', 'Подъём ног', 'Поясница прижата, ноги почти прямые; опускай медленно и не касайся пола.'],
      ['plank', 'Планка', 'Тело — прямая линия, живот и ягодицы напряжены, поясницу не прогибай.'],
    ],
    weeks: [[3, 15, 10, 30], [3, 20, 12, 40], [4, 20, 12, 50], [4, 25, 15, 60]],
    fmt: (s, k) => 'Скручивания ' + s[0] + '×' + rp(s[1], k) + ' · Подъём ног ' + s[0] + '×' + rp(s[2], k) + ' · Планка ' + s[0] + '×' + rp(s[3], k) + ' с',
  },
  {
    id: 'pl', name: 'Подтягивания', habit: 'Подтягивания', per: 3, thumb: 'pullup',
    figs: [['pullup', 'Подтягивания на турнике', 'Хват чуть шире плеч, лопатки вниз и назад, подбородок выше перекладины; опускайся плавно до полного выпрямления рук.']],
    weeks: [[4, 4], [5, 4], [5, 5], [6, 5]],
    fmt: (s, k) => s[0] + ' подходов × ' + rp(s[1], k) + ' повт. · отдых 90 с',
  },
  {
    id: 'dp', name: 'Брусья', habit: 'Брусья', per: 3, thumb: 'dips',
    figs: [['dips', 'Отжимания на брусьях', 'Корпус слегка вперёд, локти назад, опускайся до ~90° в локтях, плечи не поднимай к ушам.']],
    weeks: [[4, 5], [4, 6], [5, 6], [5, 8]],
    fmt: (s, k) => s[0] + ' подходов × ' + rp(s[1], k) + ' повт. · отдых 75 с',
  },
  {
    id: 'ch', name: 'Грудь', habit: 'Грудь', per: 2, thumb: 'cp',
    figs: [
      ['cp', 'Жим гантелей лёжа', 'Лопатки сведены, стопы на полу. Опускай гантели до уровня груди, локти под ~45°, жми вверх без удара в верхней точке.'],
      ['ci', 'Жим на наклонной скамье', 'Скамья 30–45°. Опускай гантели к верху груди, не разводи локти слишком широко, вверху не фиксируй руки жёстко.'],
      ['cpo', 'Пуловер с гантелью', 'Одна гантель двумя руками, локти чуть согнуты. Плавно заведи её за голову до растяжения груди и верни над грудью.'],
    ],
    weeks: [[3, 10, 3, 10, 3, 12], [3, 12, 3, 10, 3, 12], [4, 10, 3, 12, 3, 12], [4, 12, 4, 10, 3, 15]],
    fmt: fm(['Жим', 'Наклонный', 'Пуловер']),
  },
  {
    id: 'bi', name: 'Бицепс', habit: 'Бицепс', per: 2, thumb: 'bc',
    figs: [
      ['bc', 'Подъём гантелей стоя', 'Локти прижаты к корпусу, без раскачки. Поднимай на выдохе, внизу почти полностью выпрямляй руки.'],
      ['bco', 'Концентрированное сгибание', 'Сидя, локоть упирается во внутреннюю часть бедра. Поднимай гантель медленно, вверху на секунду сожми бицепс.'],
      ['bpr', 'Сгибания на скамье Скотта', 'Плечи прижаты к подушке. Внизу не выпрямляй руки до конца, подъём плавный, без рывка.'],
    ],
    weeks: [[3, 10, 3, 10, 3, 10], [3, 12, 3, 10, 3, 10], [4, 10, 3, 12, 3, 10], [4, 12, 3, 12, 3, 12]],
    fmt: fm(['Стоя', 'Концентр.', 'Скотт']),
  },
  {
    id: 'sh', name: 'Плечи', habit: 'Плечи', per: 2, thumb: 'sp',
    figs: [
      ['sp', 'Жим гантелей стоя', 'Кор напряжён, поясницу не прогибай. Жми вверх по прямой, внизу гантели на уровне плеч.'],
      ['sfr', 'Подъём гантелей перед собой', 'Руки почти прямые, поднимай до уровня плеч без раскачки корпуса, опускай медленно.'],
      ['sfp', 'Тяга каната к лицу', 'Блок на уровне лица, тяни канат ко лбу, разводя локти в стороны. Нагружает задние дельты и верх спины.'],
    ],
    weeks: [[3, 10, 3, 12, 3, 15], [3, 12, 3, 12, 3, 15], [4, 10, 3, 12, 3, 15], [4, 12, 4, 12, 3, 15]],
    fmt: fm(['Жим', 'Вперёд', 'К лицу']),
  },
  {
    id: 'tr', name: 'Трицепс', habit: 'Трицепс', per: 2, thumb: 'tpd',
    figs: [
      ['tsk', 'Французский жим лёжа', 'Плечи неподвижны, локти смотрят вверх. Опускай вес к голове и разгибай руки только за счёт трицепса.'],
      ['toe', 'Разгибание из-за головы', 'Локти у головы, не расставляй их. Опускай вес за голову до комфортного растяжения и выжимай вверх.'],
      ['tpd', 'Разгибание на блоке', 'Локти прижаты к бокам. Опускай рукоять до полного выпрямления рук, возвращай плавно.'],
    ],
    weeks: [[3, 10, 3, 10, 3, 12], [3, 12, 3, 10, 3, 12], [4, 10, 3, 12, 3, 12], [4, 12, 3, 12, 4, 12]],
    fmt: fm(['Французский', 'Из-за головы', 'Блок']),
  },
];

export const TEMPOS: { dur: number; label: string; glyph: 'chev1' | 'chev2' | 'chev3' }[] = [
  { dur: 3.6, label: 'Медленно', glyph: 'chev1' },
  { dur: 2.4, label: 'Норм', glyph: 'chev2' },
  { dur: 1.6, label: 'Быстро', glyph: 'chev3' },
];

export const REST_OPTIONS = [30, 45, 60, 90];
