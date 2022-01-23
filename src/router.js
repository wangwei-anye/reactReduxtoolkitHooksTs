import React from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import Loadable from 'react-loadable';
import AAA from './routes/AAA';
import EEE from './routes/AAA/EEE';
import BBB from './routes/BBB';
import CCC from './routes/CCC';
import CommonLayout from './components/CommonLayout';
import Loading from './components/Loading';

const LoadableDDD = Loadable({
  loader: () => import('./routes/AAA/DDD'),
  loading: Loading,
  delay: 300
});

function routerConfig() {
  return (
    <Router>
      <CommonLayout>
        <Switch>
          <AAA path='/aaa'>
            <Route path='/aaa/ddd' component={LoadableDDD} />
            <Route path='/aaa/eee' component={EEE} />
          </AAA>
          <Route path='/bbb' component={BBB} />
          <Route path='/ccc' component={CCC} />
        </Switch>
      </CommonLayout>
    </Router>
  );
}
export default routerConfig;
