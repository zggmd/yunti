import { Button, Result } from 'antd';
import React from 'react';

const Page404: React.FC = () => (
  <Result
    extra={
      <Button onClick={() => (window.location.pathname = '/')} type="primary">
        回到主页
      </Button>
    }
    status="404"
    subTitle="你访问的页面未找到"
    title="404"
  />
);

export default Page404;
