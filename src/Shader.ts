import regl from 'regl';
import {mainFrag, vertFrag, viewFrag} from './Frags';

interface Props {
  buf?: regl.Framebuffer2D;
  width?: number;
  height?: number;
  useVirus?: boolean;
}

const reglBaseObj: regl.DrawConfig = {
  vert: vertFrag,

  attributes: {
    position: [-4, -4, 4, -4, 0, 4],
  },

  depth: {enable: false},

  count: 3,
};

export class Shader {
  canvasGl: WebGL2RenderingContext;
  canvasRegl: regl.Regl;

  buffers: regl.Framebuffer2D[];
  flip: number = 0;

  drawCanvas: Function;
  updateBuffer: Function;

  constructor(public canvas: HTMLCanvasElement) {}

  destroyRegl() {
    if (this.buffers) {
      this.buffers[0].destroy();
      this.buffers[1].destroy();
    }
    this.canvasRegl?.destroy();
  }

  width: number;
  height: number;
  useVirus: boolean;
  init(width: number, height: number, initData?: regl.TextureImageData, virus = true) {
    this.destroyRegl();
    this.canvas.width = width;
    this.canvas.height = height;

    this.canvasGl = this.canvas.getContext('webgl2', {preserveDrawingBuffer: true});
    this.canvasRegl = regl(this.canvasGl);

    this.drawCanvas = this.canvasRegl({
      ...reglBaseObj,
      frag: viewFrag,
      uniforms: {
        buf: () => this.buffers[this.flip],
      },
    });

    this.updateBuffer = this.canvasRegl({
      ...reglBaseObj,
      frag: mainFrag,
      uniforms: {
        buf: () => this.buffers[this.flip],
        width: () => this.width,
        height: () => this.height,
      },
      framebuffer: () => this.buffers[1 - this.flip],
    });

    this.width = width;
    this.height = height;
    this.useVirus = virus;

    this.buffers = [0, 1].map(() =>
      this.canvasRegl.framebuffer({
        color: this.canvasRegl.texture({
          shape: [width, height, 4],
          data: initData,
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
  update() {
    this.updateBuffer();
    this.flip = 1 - this.flip;
    this.queueNextDraw();
  }
  queueNextDraw() {
    if (!this.pending) {
      this.pending = true;
      window.requestAnimationFrame(this.doNextDraw);
    }
  }
  doNextDraw = () => {
    this.pending = false;
    this.drawCanvas();
  };

  saveImage() {
    let blob = this.canvas.toBlob(
      (blob: Blob) => {
        let blobUrl = URL.createObjectURL(blob);
        let aElement = document.createElement('a');
        aElement.href = blobUrl;
        aElement.download = 'amoeba.webp';
        aElement.style.position = 'absolute';
        aElement.style.opacity = '0';
        document.body.append(aElement);
        aElement.click();
        setTimeout(() => {
          aElement.remove();
          URL.revokeObjectURL(blobUrl);
        }, 2000);
      },
      'image/webp',
      1
    );
  }
}
