import { Layout } from 'antd';
import React from 'react';
import Sidebar from './Sidebar';

const { Header, Sider, Content } = Layout;
class CommonLayout extends React.PureComponent {
  render() {
    const { children } = this.props;
    return (
      <Layout style={{ height: '100%' }}>
        <Header style={{ color: 'red' }}>Header</Header>
        <Layout>
          <Sider>
            <Sidebar />
          </Sider>
          <Content>{children}</Content>
        </Layout>
      </Layout>
    );
  }
}
export default CommonLayout;
