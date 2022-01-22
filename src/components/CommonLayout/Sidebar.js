import React from 'react';
import { Menu } from 'antd';
import { Link } from 'react-router-dom';
import {
  PieChartOutlined,
  DesktopOutlined,
  ContainerOutlined,
  MailOutlined
} from '@ant-design/icons';

const MenuItem = Menu.Item;
const SubMenu = Menu.SubMenu;
class Sidebar extends React.PureComponent {
  render() {
    return (
      <Menu defaultSelectedKeys={['1']} defaultOpenKeys={['sub1']} mode='inline'>
        <MenuItem key='1' icon={<PieChartOutlined />}>
          <Link to='/aaa'> AAA</Link>
        </MenuItem>
        <MenuItem key='2' icon={<DesktopOutlined />}>
          <Link to='/bbb'> BBB</Link>
        </MenuItem>
        <MenuItem key='3' icon={<ContainerOutlined />}>
          <Link to='/ccc'> CCC</Link>
        </MenuItem>
        <MenuItem key='4' icon={<ContainerOutlined />}>
          <Link to='/aaa/ddd'> DDD</Link>
        </MenuItem>
        <MenuItem key='5' icon={<ContainerOutlined />}>
          <Link to='/aaa/eee'> EEE</Link>
        </MenuItem>
        <SubMenu key='sub1' icon={<MailOutlined />} title='Navigation One'>
          <MenuItem key='15'>Option 5</MenuItem>
          <MenuItem key='16'>Option 6</MenuItem>
          <MenuItem key='17'>Option 7</MenuItem>
          <MenuItem key='18'>Option 8</MenuItem>
        </SubMenu>
      </Menu>
    );
  }
}

export default Sidebar;
