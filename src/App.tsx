import React from 'react';
import {Select, Button, Dropdown, Menu, Layout} from 'antd';
import {CaretRightOutlined, DownOutlined} from '@ant-design/icons';
import {ClickParam} from 'antd/lib/menu';
import {Stage} from './Stage';

const {Option} = Select;
const {Sider, Content} = Layout;

function handleChange(value: string) {
  console.log(`selected ${value}`);
}

function handleExampleClick(param: ClickParam) {
  console.log(`menu clicked ${param}`);
}

const examplesMenu = (
  <Menu onClick={handleExampleClick}>
    <Menu.Item key="1">1st menu item</Menu.Item>
    <Menu.Item key="2">2nd menu item</Menu.Item>
    <Menu.Item key="3">3rd item</Menu.Item>
  </Menu>
);

interface Props {}

export const App = (props: Props) => {
  return (
    <Layout>
      <Content>
        <Stage />
      </Content>
      <Sider breakpoint="lg" collapsedWidth="0" reverseArrow>
        <div className="sider">
          <div className="sider-item">
            <Button type="primary" icon={<CaretRightOutlined />}>
              Play
            </Button>
            <Button icon={<CaretRightOutlined />}>Step</Button>
          </div>
          <div className="sider-item">
            <span>speed:</span>
            <Select defaultValue="slow" style={{width: 120}} onChange={handleChange}>
              <Option value="snail">snail</Option>
              <Option value="slow">tortoise</Option>
              <Option value="hare">hare</Option>
              <Option value="cheetah">cheetah</Option>
              <Option value="blue-hedgehog">blue hedgehog</Option>
            </Select>
          </div>
          <div className="sider-item">
            <Dropdown overlay={examplesMenu}>
              <Button>
                Load Example
                <DownOutlined />
              </Button>
            </Dropdown>
          </div>
        </div>
      </Sider>
    </Layout>
  );
};
