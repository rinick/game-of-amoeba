import React from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import classNames from 'classnames';
import {Shader} from './Shader';

interface Props {}
interface State {
  imgW: number;
  imgH: number;
  canvasScale: 'h' | 'v';
  pixelated: boolean;
  delay: number;
}

export class Stage extends React.PureComponent<Props, State> {
  state: State = {imgW: 64, imgH: 64, canvasScale: 'h', delay: 160, pixelated: true};
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

    let {delay} = this.state;
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

  handleResize = (entries: ResizeObserverEntry[]) => {
    let {imgW, imgH} = this.state;
    let entry = entries[0];
    let imgR = imgW / imgH;
    let stageR = entry.contentRect.width / entry.contentRect.height;
    let pixelated = entry.contentRect.width > imgW * 1.75 && entry.contentRect.height > imgH * 1.75;
    if (stageR >= imgR) {
      this.setState({canvasScale: 'h', pixelated});
    } else {
      this.setState({canvasScale: 'v', pixelated});
    }
  };
  updateSpeed(delay: number) {
    this.setState({delay}, this.startTimer);
  }
  step() {
    this.shader?.update();
  }
  mounted = false;
  componentDidMount() {
    let {imgW, imgH, canvasScale, pixelated} = this.state;
    this.resizeObserver = new ResizeObserver(this.handleResize);
    this.resizeObserver.observe(this._rootNode);
    this.mounted = true;
    this.shader = new Shader(this._canvasNode);
    this.shader.init(imgW, imgH);
    this.startTimer();
  }

  render() {
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
