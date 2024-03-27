import { project } from '@alilc/lowcode-engine';
import { IPublicModelPluginContext } from '@alilc/lowcode-types';
import { ReloadOutlined } from '@ant-design/icons';
import { InputNumber } from 'antd';
import React, { useEffect, useState } from 'react';

import { MobileSVG, PadSVG, PcSVG } from './icons';
import './index.less';

const devices = [{ key: 'desktop' }, { key: 'tablet' }, { key: 'phone' }];

export const SimulatorPane: React.FC = () => {
  const [device, setDevice] = useState('desktop');
  const [currentWidth, setCurrentWidth] = useState(0);

  useEffect(() => {
    project.onSimulatorRendererReady(() => {
      const width =
        document.querySelector('.lc-simulator-canvas')?.clientWidth || currentWidth || 0;
      setCurrentWidth(width);
    });
  }, []);

  const change = (_device: string) => {
    const simulator = project.simulatorHost;
    // 切换画布
    simulator?.set('device', _device);
    document.querySelector<HTMLElement>('.lc-simulator-canvas').style.width = '';
    setTimeout(() => {
      const width =
        document.querySelector('.lc-simulator-canvas')?.clientWidth || currentWidth || 0;
      setDevice(_device);
      setCurrentWidth(width);
    }, 0);
  };

  function renderItemSVG(_device: string) {
    switch (_device) {
      case 'desktop': {
        return <PcSVG />;
      }
      case 'phone': {
        return <MobileSVG />;
      }
      case 'tablet': {
        return <PadSVG />;
      }
      default: {
        return <PcSVG />;
      }
    }
  }

  const [rerenderSpin, setRerenderSpin] = useState(false);
  const rerender = () => {
    setRerenderSpin(true);
    // 触发画布重新渲染
    // project.simulatorHost?.rerender();
    project.importSchema(project.exportSchema());
    setTimeout(() => {
      setRerenderSpin(false);
    }, 1000);
  };

  return (
    <div className="lp-simulator-pane">
      <span className="lp-simulator-pane-item" onClick={rerender} title="刷新画布">
        <ReloadOutlined spin={rerenderSpin} />
      </span>
      {devices.map(item => {
        return (
          <span
            className={`lp-simulator-pane-item ${device === item.key ? 'actived' : ''}`}
            key={item.key}
            onClick={() => change(item.key)}
          >
            {renderItemSVG(item.key)}
          </span>
        );
      })}
      <div className="lp-simulator-width-setter">
        <InputNumber
          addonAfter="px"
          onChange={value => {
            setCurrentWidth(value);
          }}
          onPressEnter={event => {
            const target = event.target as HTMLInputElement;
            const value = +target?.value || 0;
            document.querySelector<HTMLElement>('.lc-simulator-canvas').style.width = `${value}px`;
            setCurrentWidth(value);
          }}
          placeholder="请输入宽度"
          value={currentWidth}
        />
      </div>
    </div>
  );
};

const pluginName = 'PluginSimulatorConroller';
export const PluginSimulatorConroller = (ctx: IPublicModelPluginContext) => {
  return {
    name: pluginName,
    // 插件的初始化函数，在引擎初始化之后会立刻调用
    async init() {
      // 往引擎增加工具条
      ctx.skeleton.add({
        area: 'top',
        name: pluginName,
        type: 'Widget',
        props: {
          description: '画布控制器',
          align: 'center',
        },
        content: SimulatorPane,
      });
    },
  };
};

PluginSimulatorConroller.pluginName = pluginName;

export default PluginSimulatorConroller;
