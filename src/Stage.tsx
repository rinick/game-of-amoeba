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
  state: State = {imgH: 64, imgW: 64, canvasScale: 'h', delay: 100, pixelated: true};
  resizeObserver: any;
  shader: Shader;

  timeout: any;

  startTimer = () => {
    let {delay} = this.state;
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    if (delay != Infinity) {
      this.timeout = setTimeout(this.updateShader, delay);
    }
  };
  updateShader = () => {
    this.timeout = null;
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

  componentDidMount() {
    this.resizeObserver = new ResizeObserver(this.handleResize);
    this.resizeObserver.observe(this._rootNode);
    this.shader = new Shader(this._canvasNode);
    this.shader.init(64, 64);
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
}
