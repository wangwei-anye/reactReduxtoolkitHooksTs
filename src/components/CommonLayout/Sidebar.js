import React from 'react';
import { Menu } from 'antd';
import { Link } from 'react-router-dom';
import menuConfig from '@/config/menu.config.js';

const MenuItem = Menu.Item;
const SubMenu = Menu.SubMenu;

const getMenu = (menuData) => {
  return menuData.map((item) => {
    if (item.subMenu) {
      return (
        <SubMenu key={item.id} icon={item.icon} title={item.title}>
          {getMenu(item.subMenu)}
        </SubMenu>
      );
    }
    return (
      <MenuItem key={item.id} icon={item.icon}>
        <Link to={item.url}>{item.title}</Link>
      </MenuItem>
    );
  });
};

const Sidebar = () => {
  const pathname = window.location.pathname;
  const selectedKeys = [];
  for (let i = 0; i < menuConfig.length; i++) {
    if (menuConfig[i].url === pathname) {
      selectedKeys.push(menuConfig[i].id);
    }
  }
  return (
    <React.Fragment>
      {selectedKeys.length > 0 ? (
        <Menu selectedKeys={selectedKeys} mode='inline'>
          {getMenu(menuConfig)}
        </Menu>
      ) : null}
    </React.Fragment>
  );
};

export default Sidebar;
