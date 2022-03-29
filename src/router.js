import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import CommonLayout from './components/CommonLayout';
import menuConfig from '@/config/menu.config.js';
import Loadable from 'react-loadable';
import Loading from '@/components/Loading';
import MapEdit from '@/routes/mapEdit';
import Doc from '@/routes/doc';
import Test from '@/routes/test';
const getMenuRoute = (menuData) => {
  return menuData.map((item) => {
    if (item.subMenu) {
      return getMenuRoute(item.subMenu);
    } else {
      return <Route key={item.id} path={item.url} exact component={item.component} />;
    }
  });
};

const Play = Loadable({
  loader: () => import('@/routes/play'),
  loading: Loading,
  delay: 300
});
const Login = Loadable({
  loader: () => import('@/routes/login'),
  loading: Loading,
  delay: 300
});

function routerConfig() {
  return (
    <Router>
      <Switch>
        <Route path={'/login'} exact component={Login} />
        <Route path={'/play'} exact component={Play} />
        <Route path={'/map-edit'} exact component={MapEdit} />
        <Route path={'/doc'} exact component={Doc} />
        <Route path={'/test'} exact component={Test} />
        <CommonLayout>
          <Switch>
            {getMenuRoute(menuConfig)} <Redirect to='/case-lib' />
          </Switch>
        </CommonLayout>
      </Switch>
    </Router>
  );
}
export default routerConfig;
