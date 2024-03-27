import { Button as NextButton } from '@alifd/next';
import { event } from '@alilc/lowcode-engine';
import { LinkOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Drawer, Space } from 'antd';
import React, { useCallback, useState } from 'react';

import './index.less';

export interface PreviewModalInjectProps {
  previewSrc: string;
}

export type InjectPreviewModalPropsFunc = (pane: React.FC) => React.FC<PreviewModalInjectProps>;

export interface PluginPreviewRegisterOptions {
  injectPaneProps: InjectPreviewModalPropsFunc;
}

export const PreviewModal: React.FC<PreviewModalInjectProps> = props => {
  const { previewSrc } = props;

  const [visible, setVisible] = useState(false);

  const closeModal = useCallback(() => {
    setVisible(false);
  }, []);

  const openModal = useCallback(() => {
    event.emit('save');
    setVisible(true);
  }, []);
  const refeshPreviewIframe = useCallback(() => {
    const iframe = document.querySelector('#preview') as HTMLIFrameElement;
    iframe?.contentWindow?.location.reload();
  }, []);
  const openPreviewInNewTab = useCallback(() => {
    window.open(previewSrc, '_blank');
  }, [previewSrc]);

  return (
    <React.Fragment>
      <NextButton onClick={openModal} style={{ marginRight: '8px' }}>
        预览
      </NextButton>
      {visible && (
        <Drawer
          bodyStyle={{ padding: 0 }}
          destroyOnClose
          extra={
            <Space>
              <Button icon={<ReloadOutlined />} onClick={refeshPreviewIframe} type="text">
                刷新
              </Button>
              <Button icon={<LinkOutlined />} onClick={openPreviewInNewTab} type="text">
                新窗口打开
              </Button>
            </Space>
          }
          footer={null}
          onClose={closeModal}
          open={visible}
          title="本地预览"
          width="94vw"
        >
          <iframe
            id="preview"
            src={previewSrc}
            style={{
              border: 'none',
              width: '100%',
              height: 'calc(100vh - 65px)',
            }}
            title="preview"
          />
        </Drawer>
      )}
    </React.Fragment>
  );
};
