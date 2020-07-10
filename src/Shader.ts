import regl from 'regl';
import {mainFrag, viewFrag} from './Frags';

interface Props {
  buf?: regl.Framebuffer2D;
  width?: number;
  height?: number;
  useVirus?: boolean;
}

const reglBaseObj: regl.DrawConfig = {
  vert: `
  precision mediump float;
  attribute vec2 position;
  varying vec2 uv;
  void main() {
    uv = 0.5 * (position + 1.0);
    gl_Position = vec4(position, 0, 1);
  }`,

  attributes: {
    position: [-4, -4, 4, -4, 0, 4],
  },

  depth: {enable: false},

  count: 3,
};

export class Shader {
  canvasRegl = regl(this.canvas);

  buffers: regl.Framebuffer2D[];
  flip: number = 0;

  drawCanvas = this.canvasRegl({
    ...reglBaseObj,
    frag: viewFrag,
    uniforms: {
      buf: () => this.buffers[this.flip],
    },
  });

  updateBuffer = this.canvasRegl({
    ...reglBaseObj,
    frag: mainFrag,
    uniforms: {
      buf: () => this.buffers[this.flip],
      width: () => this.width,
      height: () => this.height,
    },
    framebuffer: () => this.buffers[1 - this.flip],
  });

  constructor(public canvas: HTMLCanvasElement) {}

  width: number;
  height: number;
  useVirus: boolean;
  init(width: number, height: number, initData?: regl.TextureImageData, virus = true) {
    this.width = width;
    this.height = height;
    this.useVirus = virus;

    const INITIAL_CONDITIONS = Array(width * height * 4).fill(0);
    for (let i = 0; i < INITIAL_CONDITIONS.length; ++i) {
      INITIAL_CONDITIONS[i] = [5 * 16, 6 * 16, 7 * 16, 9 * 16, 10 * 16, 11 * 16][Math.floor(Math.random() * 6)];
    }

    this.buffers = [0, 1].map(() =>
      this.canvasRegl.framebuffer({
        color: this.canvasRegl.texture({
          shape: [width, height, 4],
          data: INITIAL_CONDITIONS,
          mag: 'nearest',
          wrap: 'repeat',
        }),
        depthStencil: false,
      })
    );
    this.flip = 0;
    this.drawCanvas();
  }

  pending = false;
  update(drawNow: boolean = false) {
    this.updateBuffer();
    this.flip = 1 - this.flip;
    if (drawNow) {
      this.doNextDraw();
    } else {
      this.queueNextDraw();
    }
  }
  queueNextDraw() {
    if (!this.pending) {
      this.pending = true;
      this.canvasRegl.frame(this.doNextDraw);
    }
  }
  doNextDraw = () => {
    this.pending = false;
    this.drawCanvas();
  };
}
