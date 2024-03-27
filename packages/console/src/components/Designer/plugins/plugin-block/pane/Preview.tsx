import { Button, ConfigProvider, Modal } from 'antd';
import * as React from 'react';

import { Block, getBlockName } from '../common';

interface PreviewBlockProps {
  block: Block;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const PreviewBlock = (props: PreviewBlockProps) => {
  const { block, open, setOpen } = props;

  return (
    <ConfigProvider prefixCls="yunti">
      <Modal
        footer={[
          <Button key="cancel" onClick={() => setOpen(false)}>
            关闭
          </Button>,
        ]}
        onCancel={() => {
          setOpen(false);
        }}
        open={open}
        title={`区块预览：${getBlockName(block)}`}
        width={1024}
      >
        <div
          style={{
            display: 'flex',
            background: 'rgba(0,0,0,0.3)',
            padding: '20px 0',
            borderRadius: 2,
            minHeight: 'calc(100vh - 400px)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div>
            <img alt="图片加载失败" src={block.screenshot} />
          </div>
        </div>
      </Modal>
    </ConfigProvider>
  );
};

export default PreviewBlock;
