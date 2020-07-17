export interface Preset {
  en?: string;
  zh?: string;
  width: number;
  height: number;
  useVirus: boolean;

  generator: () => number[];
  load?: () => Promise<any>;
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
/*
hhh
src.f69400ca.js:74547 hbb
src.f69400ca.js:74547 901
src.f69400ca.js:74547 e12
src.f69400ca.js:74547 aeh
src.f69400ca.js:74547 17e
src.f69400ca.js:74547 049
 */

const colorToValue: {[key: string]: number} = {
  'hhh': 255,
  'h0h': 4 * 16,
  '049': 5 * 16,
  '17e': 6 * 16,
  'aeh': 7 * 16,
  '901': 9 * 16,
  'e12': 10 * 16,
  'hbb': 11 * 16,
};

function imageDataToBufferData(imageData: ImageData): number[] {
  const data = Array(imageData.width * imageData.height * 4).fill(0);
  let pixels = imageData.data;
  let set = new Set<string>();
  let {width, height} = imageData;
  for (let j = 0; j < height; ++j)
    for (let i = 0; i < width; ++i) {
      let p = (j * width + i) * 4;
      let s = `${Math.round(pixels[p] / 15).toString(18)}${Math.round(pixels[p + 1] / 15).toString(18)}${Math.round(
        pixels[p + 2] / 15
      ).toString(18)}`;
      if (colorToValue.hasOwnProperty(s)) {
        data[((height - j - 1) * width + i) * 4] = colorToValue[s];
      }
    }
  return data;
}

export class LoadImage implements Preset {
  width: number;
  height: number;
  useVirus = true;
  data: number[];

  generator() {
    return this.data;
  }
  constructor(public en: string, public zh?: string, public imgFile?: Blob) {
    if (!zh) {
      this.zh = en;
    }
  }
  load() {
    return new Promise<any>((rsolve) => {
      let img = new Image();
      let url: string;
      if (this.imgFile) {
        url = URL.createObjectURL(this.imgFile);
      } else {
        url = `./presets/${this.en}.webp`;
      }
      img.onload = () => {
        var canvas = document.createElement('canvas');
        this.width = canvas.width = img.width;
        this.height = canvas.height = img.height;

        var context = canvas.getContext('2d');
        context.drawImage(img, 0, 0);
        this.data = imageDataToBufferData(context.getImageData(0, 0, img.width, img.height));
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
        rsolve();
      };
      img.src = url;
    });
  }
}

export const presets: {[key: string]: Preset} = {
  battle128: genBattle(128),
  battle256: genBattle(256),
  battle512: genBattle(512),
  battle1024: genBattle(1024),
  solo128: genSolo(128),
  solo256: genSolo(256),
  solo512: genSolo(512),
  test: new LoadImage('test'),
};
export const defaultPreset = presets.test;
