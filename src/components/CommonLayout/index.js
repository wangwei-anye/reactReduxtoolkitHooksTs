import { Layout } from 'antd';
import React from 'react';
import Sidebar from './Sidebar';
import { LogoutOutlined, QuestionCircleOutlined } from '@ant-design/icons';
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
  gotoDoc = () => {
    window.open(`/doc`);
  };

  render() {
    const { children } = this.props;
    const { collapsed } = this.state;

    let userInfo = {};
    if (localStorage.userInfo) {
      userInfo = JSON.parse(localStorage.userInfo);
    }
    return (
      <Layout className='common-layout'>
        <React.Fragment>
          <Header className='layouit-header'>
            国汽智控云端自动驾驶仿真测试平台
            <div className='doc-link'>
              <Tooltip placement='bottom' title={'版本更新'} onClick={this.gotoDoc}>
                <QuestionCircleOutlined></QuestionCircleOutlined>
              </Tooltip>
            </div>
            <div className='userName'>{userInfo && userInfo.name ? userInfo.name : 'admin'}</div>
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
