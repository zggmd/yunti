import { Typography as Tpy } from '@tenx-ui/materials';
import {
  Avatar,
  Button,
  Empty,
  Form,
  Input,
  Space,
  Spin,
  Timeline,
  Tooltip,
  Typography,
} from 'antd';
import * as React from 'react';

import { message as msg } from '@/layouts';

export interface GitCommit {
  page: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  nodes?: {
    hash: string;
    committer: string;
    email: string;
    date: number;
    message: string;
  }[];
}

export interface GitCommitPaneInjectProps {
  /** 提交列表 */
  commits: GitCommit[];
  /** 首次加载 loading */
  loading: boolean;
  /** 提交当前修改的函数 */
  doCommit: (message: string) => Promise<void>;
  /** 加载下一页的函数 */
  loadMore: () => any;
  /** 是否正在加载下一页 */
  loadMoreLoading: boolean;
  /** 是否有下一页 */
  hasNextPage: boolean;
  /** 提交输入框的空白提示 */
  commitInputPlaceholder?: string;
}

export type InjectGitCommitPanePropsFunc = (pane: React.FC) => React.FC<GitCommitPaneInjectProps>;

export interface PluginGitCommitRegisterOptions {
  injectPaneProps: InjectGitCommitPanePropsFunc;
}

const { Text, Paragraph } = Typography;

export const GitCommitPane: React.FC<GitCommitPaneInjectProps> = props => {
  const [form] = Form.useForm();
  const {
    commits,
    loading,
    doCommit,
    loadMore,
    loadMoreLoading,
    hasNextPage,
    commitInputPlaceholder,
  } = props;
  const [btnLoading, setBtnLoading] = React.useState(false);
  const submitCommit = async () => {
    const values = await form.validateFields();
    const { message } = values;
    if (!message || !message.trim()) {
      msg.warning('请填写提交信息');
      return;
    }
    setBtnLoading(true);
    try {
      await doCommit(message);
      form.resetFields();
      msg.success('提交成功');
    } catch {
      //
    } finally {
      setBtnLoading(false);
    }
  };
  return (
    <div style={{ height: '100%' }}>
      <div style={{ padding: 16 }}>
        <Form form={form}>
          <Form.Item name="message" rules={[{ required: true, message: '请填写提交信息' }]}>
            <Input.TextArea
              placeholder={
                commitInputPlaceholder ||
                "请填写提交信息，默认会带上 'Update page page-xxxxx: ' 的前缀 '"
              }
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
        <Button
          loading={btnLoading}
          onClick={submitCommit}
          size="large"
          style={{ width: '100%', marginTop: 8 }}
          type="primary"
        >
          提交所有修改
        </Button>
      </div>
      {!loading && !commits?.length && <Empty description="暂无提交记录" />}
      <div style={{ overflow: 'auto', height: 'calc(100% - 156px)' }}>
        <Spin spinning={loading}>
          <Timeline style={{ marginLeft: 16, marginTop: 16 }}>
            {commits?.map(c =>
              c.nodes?.map(({ hash, committer, date, message }) => (
                <Timeline.Item key={hash}>
                  <Typography>
                    <Text ellipsis strong>
                      {message}
                    </Text>
                    <Paragraph>
                      <Space>
                        <Tooltip title={`打开当前版本: ${hash.slice(0, 8)}`}>
                          <a
                            href={`${window.location.pathname}?tree=${hash}`}
                            rel="noreferrer"
                            target="_blank"
                          >
                            <code>{hash.slice(0, 8)}</code>
                          </a>
                        </Tooltip>
                        <Tooltip title={committer}>
                          <Avatar size={20} style={{ backgroundColor: '#f56a00' }}>
                            {committer.slice(0, 1)}
                          </Avatar>
                        </Tooltip>
                        <Text ellipsis type="secondary">
                          committed
                        </Text>
                        <Text ellipsis type="secondary">
                          <Tpy.Time time={date} />
                        </Text>
                      </Space>
                    </Paragraph>
                  </Typography>
                </Timeline.Item>
              ))
            )}
          </Timeline>
          <div style={{ textAlign: 'center', paddingBottom: 16 }}>
            {!loading && hasNextPage && (
              <Button loading={loadMoreLoading} onClick={loadMore}>
                加载更多
              </Button>
            )}
            {!hasNextPage && <i>没有了~</i>}
          </div>
        </Spin>
      </div>
    </div>
  );
};

export default GitCommitPane;
