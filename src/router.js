import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import CommonLayout from './components/CommonLayout';
import menuConfig from '@/config/menu.config.js';
import Loadable from 'react-loadable';
import Loading from '@/components/Loading';
const getMenuRoute = (menuData) => {
  return menuData.map((item) => {
    if (item.subMenu) {
      return getMenuRoute(item.subMenu);
    } else {
      return <Route key={item.id} path={item.url} component={item.component} />;
    }
  });
};

const Play = Loadable({
  loader: () => import('@/routes/play'),
  loading: Loading,
  delay: 300
});

function routerConfig() {
  return (
    <Router>
      <CommonLayout>
        <Switch>{getMenuRoute(menuConfig)}</Switch>
        <Route path={'/play'} component={Play} />
      </CommonLayout>
    </Router>
  );
}
export default routerConfig;
