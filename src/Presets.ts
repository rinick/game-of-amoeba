export interface Preset {
  en?: string;
  zh?: string;
  width: number;
  height: number;
  useVirus: boolean;

  generator: () => number[];
}

function randomInit(option: number[]) {
  return Math.round((option[Math.floor(Math.random() * option.length)] * 255) / 16);
}

function fillRoundBuffer(data: number[], width: number, option: number[], x: number, y: number, r: number) {
  let x0 = x - r;
  let x1 = x + r;
  let y0 = y - r;
  let y1 = y + r;
  let d = r * r + 1;
  for (let j = y0; j <= y1; j++) {
    let dy = (j - y) * (j - y);
    for (let i = x0; i <= x1; i++) {
      let dd = (i - x) * (i - x) + dy;
      if (dd <= d) {
        data[(i + j * width) * 4] = randomInit(option);
      }
    }
  }
}

function drawBorder(data: number[], width: number, height: number) {
  for (let i = 0; i < width; ++i) {
    data[i * 4] = 255;
    data[data.length - i * 4 - 4] = 255;
  }
  for (let i = 0; i < height; ++i) {
    data[i * width * 4] = 255;
    data[((i + 1) * width - 1) * 4] = 255;
  }
}

function genBattle(size: number): Preset {
  return {
    en: `Battle ${size}`,
    zh: `对战 ${size}`,
    width: size,
    height: size,
    useVirus: true,
    generator() {
      const data = Array(size * size * 4).fill(0);

      let half = size / 2;
      let r = size / 8 + 16;
      fillRoundBuffer(data, size, [0, 5, 6, 7], half + 1 - r, half + 1 - r, r);
      fillRoundBuffer(data, size, [0, 9, 10, 11], half - 2 + r, half - 2 + r, r);

      drawBorder(data, size, size);

      return data;
    },
  };
}

function genSolo(size: number): Preset {
  return {
    en: `Solo ${size}`,
    zh: `单体 ${size}`,
    width: size,
    height: size,
    useVirus: true,
    generator() {
      const data = Array(size * size * 4).fill(0);

      let half = size / 2 - 0.5;
      let r = size / 64 + 8.5;
      fillRoundBuffer(data, size, [0, 5, 6, 7], half, half, r);

      drawBorder(data, size, size);

      return data;
    },
  };
}
export const presets: {[key: string]: Preset} = {
  battle128: genBattle(128),
  battle256: genBattle(256),
  battle512: genBattle(512),
  battle1024: genBattle(1024),
  solo128: genSolo(128),
  solo256: genSolo(256),
  solo512: genSolo(512),
};
export const defaultPreset = presets.battle128;
