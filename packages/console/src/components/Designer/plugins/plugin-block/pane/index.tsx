import { Box } from '@alifd/next';
import { common, event, project } from '@alilc/lowcode-engine';
import { SettingOutlined } from '@ant-design/icons';
import { useSdk } from '@tenx-ui/yunti-bff-client';
import { GetCurrentUserQuery } from '@tenx-ui/yunti-bff-client/dist/esm/sdk';
import {
  Collapse,
  Dropdown,
  Empty,
  Input,
  Modal,
  Spin,
  Tabs,
  Tooltip,
  Typography,
  notification,
} from 'antd';
import * as React from 'react';

import { SaveAsBlock } from '../action/index';
import { Block, CATEGORY_MAP, checkBlockAPI, getBlockName } from '../common';
import JsEditor, { ShowModal } from './JsEditor';
import PreviewBlock from './Preview';
import styles from './index.less';
import { default as store } from './store';

let showModal = false;
let showId;
const { useState, useEffect, useMemo, useReducer } = React;

const DEFAULT_SCREENSHOT = 'https://tianshu.alicdn.com/19307bb5-2881-44ad-82d3-f92e2f44aabb.png';

interface BlockCardProps {
  item: Block;
  refresh?: () => void;
  userData?: GetCurrentUserQuery;
}

const BlockCard = (props: BlockCardProps) => {
  const { id, screenshot = DEFAULT_SCREENSHOT, creator } = props.item || {};
  const { deleteBlock } = checkBlockAPI(['deleteBlock']);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openPreviewModal, setOpenPreviewModal] = useState(false);
  const handleEdit = () => {
    setOpenEditModal(true);
  };

  const handleDelete = () => {
    const nameDom = (maxWidth?: number) => (
      <span>
        <RenderText maxWidth={maxWidth || 150}>{getBlockName(props.item)}</RenderText>
      </span>
    );
    Modal.confirm({
      title: '删除区块',
      content: <div>确定删除区块 {nameDom()} ?</div>,
      onOk: deleteBlock(id).then(
        () => {
          notification.success({
            message: <span>删除区块 {nameDom(79)} 成功</span>,
          });
          props.refresh();
        },
        error => {
          notification.warning({
            message: <span>删除区块 {nameDom(79)} 失败</span>,
            description: error.response?.errors?.[0]?.message,
          });
        }
      ),
    });
  };
  const RenderRow = ({ children }) => {
    return <div style={{ textAlign: 'center' }}>{children}</div>;
  };
  const RenderText = ({ children, maxWidth = 125 }) => {
    return (
      <Typography.Text ellipsis={{ tooltip: children }} style={{ maxWidth }}>
        {children}
      </Typography.Text>
    );
  };
  const handlePreview = () => {
    setOpenPreviewModal(true);
  };
  const disabledOperation =
    props.userData?.currentUser?.id !== creator?.id &&
    props.userData?.currentUser?.role !== 'SystemAdmin';
  const disabledTooltip = disabledOperation && `请联系创建者(${creator?.name})或系统管理员`;

  return (
    <div className="block-card snippet" data-id={id}>
      <Dropdown
        menu={{
          onClick: ({ key }) => {
            if (key === 'edit') {
              handleEdit();
            }
            if (key === 'del') {
              handleDelete();
            }
            if (key === 'preview') {
              handlePreview();
            }
          },
          items: [
            { key: 'preview', label: '预览' },
            {
              key: 'edit',
              label: <Tooltip title={disabledTooltip}>修改</Tooltip>,
              disabled: disabledOperation,
            },
            {
              key: 'del',
              label: <Tooltip title={disabledTooltip}>删除</Tooltip>,
              disabled: disabledOperation,
            },
          ],
        }}
      >
        <SettingOutlined className="block-card-setting" />
      </Dropdown>
      <div className="block-card-screenshot">
        <img src={screenshot} />
      </div>
      <RenderRow>
        <RenderText>{getBlockName(props.item)}</RenderText>
      </RenderRow>
      <RenderRow>
        (<RenderText>创建者：{props.item?.creator?.name}</RenderText>)
      </RenderRow>
      {openEditModal && (
        <SaveAsBlock block={props.item} open={openEditModal} setOpen={setOpenEditModal} />
      )}
      {openPreviewModal && (
        <PreviewBlock block={props.item} open={openPreviewModal} setOpen={setOpenPreviewModal} />
      )}
    </div>
  );
};

export interface BlockResponse {
  code: number;
  data: Block[];
}

export interface BlockPaneAPI {
  listBlocks: () => BlockResponse;
}

export interface BlockPaneProps {
  api: BlockPaneAPI;
}

export const BlockPane = (props: BlockPaneProps) => {
  const { listBlocks } = checkBlockAPI(['listBlocks']);
  const [blocks, setBlocks] = useState<Block[]>();
  const [searchValue, setSearchValue] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [jsEditorOpen, setJsEditorOpen] = useState(false);
  const [dragonBlock, setDragonBlock] = useState<Block>();
  const [updateDragonBlock, forceUpdate] = useReducer(x => x + 1, 0);
  const sdk = useSdk();
  const { data: userData } = sdk.useGetCurrentUser();
  const filterBlocks: Block[] = useMemo(() => {
    return searchValue
      ? blocks?.filter(block => block.name.includes(searchValue)) || []
      : blocks || [];
  }, [blocks, searchValue]);

  const fetchBlocks = async () => {
    setLoading(true);
    const res = await listBlocks();
    store.init(res);
    setBlocks(res);
    setLoading(false);
  };
  useEffect(() => {
    event.on('common:BlockChanged', () => {
      fetchBlocks();
    });
    fetchBlocks();
  }, []);

  const registerAdditive = (shell: HTMLDivElement | null) => {
    if (!shell || shell.dataset.registered) {
      return;
    }

    function getSnippetId(elem: any) {
      if (!elem) {
        return null;
      }
      while (shell !== elem) {
        if (elem.classList.contains('snippet')) {
          return elem.dataset.id;
        }
        elem = elem.parentNode;
      }
      return null;
    }

    const _dragon = common.designerCabin.dragon;
    if (!_dragon) {
      return;
    }

    const click = (e: Event) => {};

    shell.addEventListener('click', click);

    _dragon.from(shell, (e: Event) => {
      const doc = project.getCurrentDocument();
      const id = getSnippetId(e.target);
      if (!doc || !id) {
        return false;
      }
      showModal = true;
      showId = id;
      _dragon.onDragend(async () => {
        if (!showModal) {
          return;
        }
        const block = store.get(showId);
        block && setDragonBlock(block);
        block && forceUpdate();
        showModal = false;
      });
      const dragTarget = {
        type: 'nodedata',
        data: JSON.parse(store.get(id)?.schema),
      };
      return dragTarget;
    });
    shell.dataset.registered = 'true';
  };
  const RenderBox = ({ list }) => {
    if (!(list?.length > 0)) {
      return <Empty style={{ marginTop: '150px' }} />;
    }
    return (
      <Box direction="row" wrap>
        {list.map((block: any) => (
          <BlockCard item={block} key={block.id} refresh={fetchBlocks} userData={userData} />
        ))}
      </Box>
    );
  };
  const items = CATEGORY_MAP.map(item => {
    const list =
      item.id === 'ALL'
        ? filterBlocks || []
        : (filterBlocks || [])?.filter(block => block.category === item.id);
    const category = {
      key: item.id,
      label: item.name,
      empty: list.length === 0,
      children: <RenderBox list={list} />,
    };
    return category;
  });
  const collapseItems = items.filter(item => !item.empty);
  const renderContent = () => {
    if (searchValue) {
      return (
        <Collapse
          className={styles.collapse}
          defaultActiveKey={CATEGORY_MAP.map(item => item.id)}
          expandIconPosition="end"
          items={collapseItems}
          size="small"
        />
      );
    }

    return <Tabs items={items} size="small" tabBarStyle={{ paddingLeft: 20 }} />;
  };
  return (
    <div className="block-pane" ref={blocks && registerAdditive}>
      <ShowModal
        block={dragonBlock}
        open={jsEditorOpen}
        setOpen={setJsEditorOpen}
        updateDragonBlock={updateDragonBlock}
      />
      {jsEditorOpen && (
        <JsEditor block={dragonBlock} open={jsEditorOpen} setOpen={setJsEditorOpen} />
      )}
      <Input.Search
        onChange={e => setSearchValue(e.target.value?.trim())}
        placeholder="请输入区块名称"
        style={{ margin: '13px', width: 'calc(100% - 24px)' }}
        value={searchValue}
      />
      <Spin spinning={loading} style={{ marginTop: '50px' }}>
        {renderContent()}
      </Spin>
    </div>
  );
};

export default BlockPane;
