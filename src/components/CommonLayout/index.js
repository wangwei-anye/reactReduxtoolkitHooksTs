import { Layout } from 'antd';
import React from 'react';
import Sidebar from './Sidebar';
import '@/index.less';

const { Header, Sider, Content } = Layout;
class CommonLayout extends React.PureComponent {
  state = {
    collapsed: false
  };
  onCollapse = (collapsed) => {
    this.setState({ collapsed });
  };

  render() {
    const { children } = this.props;
    const { collapsed } = this.state;
    const url = window.location.hash;
    return (
      <Layout className='common-layout'>
        {url === '#/play' ? (
          <Content className='content-waper'>{children}</Content>
        ) : (
          <React.Fragment>
            <Header style={{ backgroundColor: 'white' }}>智能驾驶开发平台</Header>
            <Layout>
              <Sider
                style={{ backgroundColor: 'white' }}
                collapsible
                collapsed={collapsed}
                onCollapse={this.onCollapse}
              >
                <Sidebar />
              </Sider>
              <Content className='content-waper'>{children}</Content>
            </Layout>
          </React.Fragment>
        )}
      </Layout>
    );
  }
}
export default CommonLayout;
