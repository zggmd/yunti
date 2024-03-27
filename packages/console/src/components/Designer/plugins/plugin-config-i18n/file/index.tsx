import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { Form } from '@formily/core';
import { Button, Space, Upload, notification } from 'antd';
import React from 'react';
import { read, utils } from 'xlsx';

import { DesignerProjectSchema } from '../../../../../components/Designer/type';

interface ExportExcelProps {
  dataSource: { [key: string]: any }[];
  columns: {
    dataIndex: string;
    title: string;
  }[];
  name: string;
}
const exportExcel = (props: ExportExcelProps) => {
  const { columns, dataSource, name } = props;
  const columnsString = columns?.map(item => item.title)?.join(',');
  const dataString = dataSource?.map(item => {
    const rowString = columns
      ?.map(column => {
        if (column.dataIndex === 'zhCN') {
          return '"' + item[column.dataIndex] + '"';
        }
        return item[column.dataIndex]?.replace(/,/g, '，');
      })
      ?.join(',');
    return rowString;
  });
  const excelString = [columnsString].concat(dataString)?.join('\n');
  const uri = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(excelString);
  const link = document.createElement('a');
  link.href = uri;
  link.download = `${name}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
};

interface FileProps {
  schema: DesignerProjectSchema;
  i18nForm: Form;
  i18nUsage?: object;
}
const columns = [
  {
    title: '中文',
    dataIndex: 'zhCN',
  },
  {
    title: '英文',
    dataIndex: 'enUS',
  },
  {
    title: '唯一 id',
    dataIndex: 'i18nKey',
  },
];

const File = (props: FileProps) => {
  const handleExport = () => {
    exportExcel({
      columns,
      dataSource: props?.i18nForm?.values?.array,
      name: props?.schema?.meta?.name + '.zh-en',
    });
    notification.success({
      message: '导出成功',
    });
  };

  const handleImport = (file, fileList) => {
    const reader = new FileReader();
    reader.addEventListener('load', e => {
      const data = e.target.result;
      const wb = read(data, { type: 'binary' });
      const array = utils.sheet_to_json(wb?.Sheets?.[wb?.SheetNames?.[0]] || []).map(item => {
        const obj = {
          actions: {
            remove: {
              disabled: Object.keys(props.i18nUsage?.[item['唯一 id']] || {}).length > 0,
            },
          },
        };
        for (const column of columns) {
          obj[column.dataIndex] =
            column.dataIndex === 'zhCN'
              ? item[column.title]
              : item[column.title]?.replace(/，/g, ',');
        }
        return obj;
      });
      props?.i18nForm.setValues({
        array,
      });
    });
    reader.readAsBinaryString(file);
  };

  return (
    <Space size={8}>
      <Upload
        accept=".xls, .xlsx, .csv"
        beforeUpload={handleImport}
        multiple={false}
        showUploadList={false}
      >
        <Button icon={<UploadOutlined />}>导入</Button>
      </Upload>
      <Button icon={<DownloadOutlined />} onClick={handleExport}>
        导出
      </Button>
    </Space>
  );
};

export default File;
