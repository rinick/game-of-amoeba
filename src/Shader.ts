import regl from 'regl';
import {drawPixelsFrag, mainFrag, vertFrag, viewFrag} from './Frags';

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

  renderCanvas: Function;
  updateBuffer: Function;
  drawPixels: Function;

  allUniforms = {
    buf: () => this.buffers[this.flip],
    width: () => this.width,
    height: () => this.height,
    mouseX: () => (Math.floor((this.mouseX * this.width) / this.canvas.offsetWidth) + 0.5) / this.width,
    mouseY: () =>
      (Math.floor(((this.canvas.offsetHeight - this.mouseY - 1) * this.height) / this.canvas.offsetHeight) + 0.5) /
      this.height,
    drawSize: () => this.drawSize,
    drawType: (context: any, props: any) => {
      let drawType = props?.drawType || 0;
      if (!(drawType >= 0)) {
        return 0;
      } else if (drawType > 17) {
        // add a random seed
        return drawType + Math.random();
      }
      return drawType;
    },
  };

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
  mouseX: number = 80;
  mouseY: number = 90;
  drawSize: number = 0;
  useVirus: boolean;
  init(width: number, height: number, initData?: regl.TextureImageData, virus = true) {
    this.destroyRegl();
    this.canvas.width = width;
    this.canvas.height = height;

    this.canvasGl = this.canvas.getContext('webgl2', {preserveDrawingBuffer: true});
    this.canvasRegl = regl(this.canvasGl);

    this.renderCanvas = this.canvasRegl({
      ...reglBaseObj,
      frag: viewFrag,
      uniforms: this.allUniforms,
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
    this.drawPixels = this.canvasRegl({
      ...reglBaseObj,
      frag: drawPixelsFrag,
      uniforms: this.allUniforms,
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
    this.renderCanvas();
  }

  mouseMove(x: number = -1000, y: number = -1000) {
    this.mouseX = x;
    this.mouseY = y;
    if (this.canvas) {
      this.queueNextRender();
    }
  }
  updateDrawSize(size: number) {
    if (size !== this.drawSize) {
      this.drawSize = size;
      this.mouseMove();
    }
  }
  addPixels(drawType: number) {
    this.drawPixels({drawType});
    this.flip = 1 - this.flip;
    this.queueNextRender();
  }
  update() {
    this.updateBuffer();
    this.flip = 1 - this.flip;
    this.queueNextRender();
  }
  pending = false;
  queueNextRender() {
    if (!this.pending) {
      this.pending = true;
      window.requestAnimationFrame(this.doNextRender);
    }
  }
  doNextRender = () => {
    this.pending = false;
    this.renderCanvas();
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
