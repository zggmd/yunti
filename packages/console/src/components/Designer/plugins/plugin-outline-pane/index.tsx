/**
 * 大纲树插件
 *
 * https://github.com/alibaba/lowcode-engine/blob/main/packages/plugin-outline-pane/src/index.tsx
 * 主要是增加了 title
 *
 */
import { OutlinePaneContext } from '@alilc/lowcode-plugin-outline-pane/lib';
import { TreeMaster } from '@alilc/lowcode-plugin-outline-pane/lib/controllers/tree-master';
import {
  BackupPaneName,
  MasterPaneName,
} from '@alilc/lowcode-plugin-outline-pane/lib/helper/consts';
import { IconOutline } from '@alilc/lowcode-plugin-outline-pane/lib/icons/outline';
import { IPublicModelDocumentModel, IPublicModelPluginContext } from '@alilc/lowcode-types';

export const OutlinePlugin = (ctx: IPublicModelPluginContext, options: any) => {
  const { skeleton, config, canvas, project } = ctx;

  let isInFloatArea = true;
  const hasPreferenceForOutline = config
    .getPreference()
    .contains('outline-pane-pinned-status-isFloat', 'skeleton');
  if (hasPreferenceForOutline) {
    isInFloatArea = config.getPreference().get('outline-pane-pinned-status-isFloat', 'skeleton');
  }
  const showingPanes = {
    masterPane: false,
    backupPane: false,
  };
  const treeMaster = new TreeMaster(ctx, options);
  return {
    async init() {
      skeleton.add({
        area: 'leftArea',
        name: 'outlinePane',
        type: 'PanelDock',
        index: -1,
        // 这里做了改动
        props: {
          title: '大纲树',
        },
        content: {
          name: MasterPaneName,
          props: {
            icon: IconOutline,
            // 这里做了改动
            title: '大纲树',
            // description: treeMaster.pluginContext.intlNode('Outline Tree'),
          },
          content: OutlinePaneContext,
        },
        panelProps: {
          area: isInFloatArea ? 'leftFloatArea' : 'leftFixedArea',
          keepVisibleWhileDragging: true,
          ...config.get('defaultOutlinePaneProps'),
        },
        contentProps: {
          treeTitleExtra: 'xxxxx',
          // treeTitleExtra: config.get('treeTitleExtra'),
          treeMaster,
          paneName: MasterPaneName,
        },
      });

      skeleton.add({
        area: 'rightArea',
        name: BackupPaneName,
        type: 'Panel',
        props: {
          hiddenWhenInit: true,
        },
        content: OutlinePaneContext,
        contentProps: {
          paneName: BackupPaneName,
          treeMaster,
        },
      });

      // 处理 master pane 和 backup pane 切换
      const switchPanes = () => {
        const isDragging = canvas.dragon?.dragging;
        const hasVisibleTreeBoard = showingPanes.backupPane || showingPanes.masterPane;
        const shouldShowBackupPane = isDragging && !hasVisibleTreeBoard;

        if (shouldShowBackupPane) {
          skeleton.showPanel(BackupPaneName);
        } else {
          skeleton.hidePanel(BackupPaneName);
        }
      };
      canvas.dragon?.onDragstart(() => {
        switchPanes();
      });
      canvas.dragon?.onDragend(() => {
        switchPanes();
      });
      skeleton.onShowPanel((key: string) => {
        if (key === MasterPaneName) {
          showingPanes.masterPane = true;
        }
        if (key === BackupPaneName) {
          showingPanes.backupPane = true;
        }
      });
      skeleton.onHidePanel((key: string) => {
        if (key === MasterPaneName) {
          showingPanes.masterPane = false;
          switchPanes();
        }
        if (key === BackupPaneName) {
          showingPanes.backupPane = false;
        }
      });
      project.onChangeDocument((document: IPublicModelDocumentModel) => {
        if (!document) {
          return;
        }

        const { selection } = document;

        selection?.onSelectionChange(() => {
          const selectedNodes = selection?.getNodes();
          if (!selectedNodes || selectedNodes.length === 0) {
            return;
          }
          const tree = treeMaster.currentTree;
          for (const node of selectedNodes) {
            const treeNode = tree?.getTreeNodeById(node.id);
            tree?.expandAllAncestors(treeNode);
          }
        });
      });
    },
  };
};
OutlinePlugin.meta = {
  eventPrefix: 'OutlinePlugin',
  preferenceDeclaration: {
    title: '大纲树插件配置',
    properties: [
      {
        key: 'extraTitle',
        type: 'object',
        description: '副标题',
      },
    ],
  },
};
OutlinePlugin.pluginName = 'OutlinePlugin';
