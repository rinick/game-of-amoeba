import React from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import classNames from 'classnames';
import {Shader} from './Shader';
import {defaultPreset, Preset} from './Presets';

interface Props {
  delay: number;
  scale: number;
  drawSize: number;
  drawType: number;
}
interface State {
  imgW: number;
  imgH: number;
  canvasScale: 'h' | 'v' | 's';
  pixelated: boolean;
}

export class Stage extends React.PureComponent<Props, State> {
  state: State = {imgW: defaultPreset.width, imgH: defaultPreset.height, canvasScale: 'h', pixelated: true};
  resizeObserver: any;
  shader: Shader;

  timeout: any;

  startTimer = () => {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    if (!this.mounted) {
      return;
    }

    let {delay} = this.props;
    if (delay != Infinity) {
      this.timeout = setTimeout(this.updateShader, delay);
    }
  };

  updateShader = () => {
    if (this.shader) {
      let startTime = window.performance.now();
      this.shader.update();
      let {delay} = this.props;
      if (delay === 0) {
        for (let i = 0; i < 16; ++i) {
          this.shader?.update();
        }
      }
    }
    this.startTimer();
  };

  _rootNode!: HTMLElement;
  getRootRef = (node: HTMLDivElement): void => {
    this._rootNode = node;
  };

  _canvasNode!: HTMLCanvasElement;
  getCanvasRef = (c: HTMLCanvasElement): void => {
    this._canvasNode = c;
  };

  checkResize(width: number, height: number) {
    let {scale} = this.props;
    let {imgW, imgH} = this.state;
    if (scale || imgW > width || imgH > height) {
      this.setState({canvasScale: 's', pixelated: true});
    } else {
      let imgR = imgW / imgH;
      let stageR = width / height;
      let pixelated = width > imgW * 1.75 && height > imgH * 1.75;
      if (stageR >= imgR) {
        this.setState({canvasScale: 'h', pixelated});
      } else {
        this.setState({canvasScale: 'v', pixelated});
      }
    }
  }
  handleResize = (entries: ResizeObserverEntry[]) => {
    let {width, height} = entries[0].contentRect;
    this.checkResize(width, height);
  };
  forceResize() {
    this.checkResize(this._rootNode.offsetWidth, this._rootNode.offsetHeight);
  }
  step() {
    this.shader?.update();
  }
  save() {
    this.shader?.saveImage();
  }
  reload(preset: Preset) {
    this.setState({imgW: preset.width, imgH: preset.height}, () => {
      this.forceResize();
    });
    this.shader?.init(preset.width, preset.height, preset.generator());
  }
  mounted = false;
  componentDidMount() {
    let {drawSize} = this.props;
    let {imgW, imgH, canvasScale, pixelated} = this.state;
    this.resizeObserver = new ResizeObserver(this.handleResize);
    this.resizeObserver.observe(this._rootNode);
    this.mounted = true;
    this.shader = new Shader(this._canvasNode);
    this.shader.init(imgW, imgH, defaultPreset.generator());
    this.startTimer();
    this.shader?.updateDrawSize(drawSize);
  }

  onMouseMove = (e: React.MouseEvent) => {
    if (e.buttons === 1) {
      let {drawType} = this.props;
      this.shader.addPixels(drawType);
    }
    this.shader?.mouseMove(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };
  onMouseLeave = () => {
    this.shader?.mouseMove();
  };

  render() {
    let {scale, drawSize} = this.props;
    let {imgW, imgH, canvasScale, pixelated} = this.state;

    let style: any = null;
    if (scale) {
      style = {width: imgW * scale, height: imgH * scale};
    }

    this.startTimer();
    this.shader?.updateDrawSize(drawSize);

    let stageCls = classNames('amoeba-stage', `stage-scale-${canvasScale}`);
    let canvasCls = classNames('amoeba-canvas', `canvas-scale-${canvasScale}`, {pixelated: pixelated});
    return (
      <div className={stageCls} ref={this.getRootRef}>
        <canvas
          className={canvasCls}
          ref={this.getCanvasRef}
          width={imgW}
          height={imgH}
          style={style}
          onMouseDown={drawSize ? this.onMouseMove : null}
          onMouseMove={drawSize ? this.onMouseMove : null}
          onMouseLeave={drawSize ? this.onMouseLeave : null}
        />
      </div>
    );
  }

  componentWillUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.mounted = false;
  }
}
