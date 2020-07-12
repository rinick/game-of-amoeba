import React, {useRef} from 'react';
import {Select, Button, Dropdown, Menu, Layout} from 'antd';
import CaretRightOutlined from '@ant-design/icons/CaretRightOutlined';
import DownOutlined from '@ant-design/icons/DownOutlined';
import PauseOutlined from '@ant-design/icons/PauseOutlined';
import StepForwardOutlined from '@ant-design/icons/StepForwardOutlined';
import {ClickParam} from 'antd/lib/menu';
import {Stage} from './Stage';

const {Option} = Select;
const {Sider, Content} = Layout;

type SpeedEnum = 'snail' | 'tortoise' | 'hare' | 'cheetah' | 'blue-hedgehog';
const speedMap = {
  'snail': 2560,
  'tortoise': 640,
  'hare': 160,
  'cheetah': 40,
  'blue-hedgehog': 0,
};

interface State {
  speed: SpeedEnum;
  useVirus: boolean;
  playing: boolean;
}

export class App extends React.PureComponent<any, State> {
  state: State = {speed: 'cheetah', playing: true, useVirus: true};

  _stage!: Stage;
  getStageRef = (s: Stage): void => {
    this._stage = s;
  };

  onSpeedChange = (speed: SpeedEnum) => {
    let {playing} = this.state;
    this.setState({speed});
  };
  onPlay = () => {
    let {speed} = this.state;
    this.setState({playing: true});
  };
  onPause = () => {
    this.setState({playing: false});
  };
  onStep = () => {
    this._stage?.step();
  };
  onSave = () => {
    this._stage?.save();
  };
  handleExampleClick(param: ClickParam) {
    console.log(`menu clicked ${param}`);
  }

  examplesMenu = (
    <Menu onClick={this.handleExampleClick}>
      <Menu.Item key="1">1st menu item</Menu.Item>
      <Menu.Item key="2">2nd menu item</Menu.Item>
      <Menu.Item key="3">3rd item</Menu.Item>
    </Menu>
  );

  render() {
    let {speed, playing, useVirus} = this.state;
    let speedms = Infinity;
    if (playing) {
      speedms = speedMap[speed];
    }
    return (
      <Layout className="stage-layout">
        <Content>
          <Stage delay={speedms} useVirus={useVirus} ref={this.getStageRef} />
        </Content>
        <Sider breakpoint="lg" collapsedWidth="0" reverseArrow theme="light">
          <div className="sider">
            <div className="sider-item">
              {playing ? (
                <Button type="primary" icon={<PauseOutlined />} onClick={this.onPause}>
                  Pause
                </Button>
              ) : (
                <Button type="primary" icon={<CaretRightOutlined />} onClick={this.onPlay}>
                  Play
                </Button>
              )}

              <Button icon={<StepForwardOutlined />} disabled={playing} onClick={this.onStep}>
                Step
              </Button>
            </div>
            <div className="sider-item">
              <span>speed:</span>
              <Select value={speed} style={{width: 120}} onChange={this.onSpeedChange}>
                <Option value="snail">snail</Option>
                <Option value="tortoise">tortoise</Option>
                <Option value="hare">hare</Option>
                <Option value="cheetah">cheetah</Option>
                <Option value="blue-hedgehog">blue hedgehog</Option>
              </Select>
            </div>
            <div className="sider-item">
              <Dropdown overlay={this.examplesMenu}>
                <Button>
                  Load Example
                  <DownOutlined />
                </Button>
              </Dropdown>
            </div>
            <div className="sider-item">
              <Button icon={<CaretRightOutlined />} onClick={this.onSave}>
                Save
              </Button>
            </div>
          </div>
        </Sider>
      </Layout>
    );
  }
}
