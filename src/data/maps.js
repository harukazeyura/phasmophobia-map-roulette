// Phasmophobia 公式マップ一覧（サイズ: S=小 / M=中 / L=大）
// ゲームのアップデートでマップが増えたらここに追記してください。
// 画面上の「カスタムマップ追加」でも一時的に追加できます（ブラウザに保存）。
export const MAPS = [
  { id: 'tanglewood',               name: '6 Tanglewood Drive',                size: 'S' },
  { id: 'ridgeview',                name: '10 Ridgeview Court',                size: 'S' },
  { id: 'willow',                   name: '13 Willow Street',                  size: 'S' },
  { id: 'edgefield',                name: '42 Edgefield Road',                 size: 'S' },
  { id: 'bleasdale',                name: 'Bleasdale Farmhouse',               size: 'S' },
  { id: 'grafton',                  name: 'Grafton Farmhouse',                 size: 'S' },
  { id: 'woodwind',                 name: 'Camp Woodwind',                     size: 'S' },
  { id: 'nells-diner',              name: "Nell's Diner",                      size: 'S' },
  { id: 'point-hope',               name: 'Point Hope',                        size: 'S' },
  { id: 'maple-lodge',              name: 'Maple Lodge Campsite',              size: 'M' },
  { id: 'prison',                   name: 'Prison',                            size: 'M' },
  { id: 'brownstone',               name: 'Brownstone High School',            size: 'L' },
  { id: 'sunny-meadows',            name: 'Sunny Meadows Mental Institution',  size: 'L' },

  // 制限マップ（Restricted）
  // Prison / Point Hope / Brownstone は Quality of Life Part 2（2026-08-25）で追加
  { id: 'prison-restricted',        name: 'Prison Restricted',                 size: 'S' },
  { id: 'point-hope-restricted',    name: 'Point Hope Restricted',             size: 'S' },
  { id: 'sunny-meadows-restricted', name: 'Sunny Meadows Restricted',          size: 'M' },
  { id: 'brownstone-restricted',    name: 'Brownstone High School Restricted', size: 'M' },
];
