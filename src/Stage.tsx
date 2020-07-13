import React from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import classNames from 'classnames';
import {Shader} from './Shader';
import {defaultPreset, Preset} from './Presets';

interface Props {
  delay: number;
  useVirus: boolean;
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
    this.shader?.update();
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
    let {imgW, imgH} = this.state;
    if (imgW > width || imgH > height) {
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
  step() {
    this.shader?.update();
  }
  save() {
    this.shader?.saveImage();
  }
  reload(preset: Preset) {
    this.setState({imgW: preset.width, imgH: preset.height}, () => {
      this.checkResize(this._canvasNode.offsetWidth, this._canvasNode.offsetHeight);
    });
    this.shader?.init(preset.width, preset.height, preset.generator());
  }
  mounted = false;
  componentDidMount() {
    let {imgW, imgH, canvasScale, pixelated} = this.state;
    this.resizeObserver = new ResizeObserver(this.handleResize);
    this.resizeObserver.observe(this._rootNode);
    this.mounted = true;
    this.shader = new Shader(this._canvasNode);
    this.shader.init(imgW, imgH, defaultPreset.generator());
    this.startTimer();
  }

  render() {
    this.startTimer();

    let {imgW, imgH, canvasScale, pixelated} = this.state;
    let cls = classNames('amoeba-canvas', `canvas-scale-${canvasScale}`, {pixelated: pixelated});
    return (
      <div className="content-stage" ref={this.getRootRef}>
        <canvas className={cls} ref={this.getCanvasRef} width={imgW} height={imgH} />
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
