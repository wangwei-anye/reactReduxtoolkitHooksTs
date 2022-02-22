import { Layout } from 'antd';
import React from 'react';
import Sidebar from './Sidebar';
import { LogoutOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import '@/index.less';

const { Header, Sider, Content } = Layout;
class CommonLayout extends React.PureComponent {
  state = {
    collapsed: false
  };
  onCollapse = (collapsed) => {
    this.setState({ collapsed });
  };
  logout = () => {
    window.location.href = '/login';
  };

  render() {
    const { children } = this.props;
    const { collapsed } = this.state;
    return (
      <Layout className='common-layout'>
        <React.Fragment>
          <Header className='layouit-header'>
            智能驾驶开发平台
            <div className='userName'>用户名</div>
            <div className='logout' onClick={this.logout}>
              <Tooltip placement='bottom' title={'登出'}>
                <LogoutOutlined></LogoutOutlined>
              </Tooltip>
            </div>
          </Header>
          <Layout>
            <Sider
              style={{ backgroundColor: 'white', width: 120 }}
              collapsible
              collapsed={collapsed}
              onCollapse={this.onCollapse}
            >
              <Sidebar />
            </Sider>
            <Content className='content-waper'>{children}</Content>
          </Layout>
        </React.Fragment>
      </Layout>
    );
  }
}
export default CommonLayout;
