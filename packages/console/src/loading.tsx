import { Spin } from 'antd';
import React from 'react';

const PageLoading: React.FC = () => (
  <div className="page-loading-box">
    <Spin size="large" tip="Loading ..." />
  </div>
);

export default PageLoading;
