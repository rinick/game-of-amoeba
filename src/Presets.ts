export interface Preset {
  en?: string;
  zh?: string;
  width: number;
  height: number;
  useVirus: boolean;

  generator: () => number[];
}

function randomInit(fillTarget: number[]) {
  return Math.round((fillTarget[Math.floor(Math.random() * fillTarget.length)] * 255) / 16);
}

function genBattle(size: number): Preset {
  return {
    en: `Battle ${size}x${size}`,
    zh: `对战 ${size}x${size}`,
    width: size,
    height: size,
    useVirus: true,
    generator() {
      const data = Array(size * size * 4).fill(0);
      let half = size / 2;
      let padding = size / 16;
      let end0 = half - 1 - padding;
      let start0 = end0 - 46 - padding;
      let start1 = half + padding;
      let end1 = start1 + 46 + padding;
      for (let i = start0; i <= end0; i++)
        for (let j = start0; j <= end0; j++) {
          data[(i + j * size) * 4] = randomInit([0, 5, 6]);
        }

      for (let i = start1; i <= end1; i++)
        for (let j = start1; j <= end1; j++) {
          data[(i + j * size) * 4] = randomInit([0, 9, 10]);
        }

      // draw a border
      for (let i = 0; i < size; ++i) {
        data[i * 4] = 255;
        data[data.length - i * 4 - 4] = 255;
        data[i * size * 4] = 255;
        data[((i + 1) * size - 1) * 4] = 255;
      }
      return data;
    },
  };
}
export const battles = {
  battle128: genBattle(128),
  battle256: genBattle(256),
  battle512: genBattle(512),
  battle1024: genBattle(1024),
};
export const defaultBattle = battles.battle256;
