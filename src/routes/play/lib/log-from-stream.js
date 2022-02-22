import { XVIZStreamLoader } from 'streetscape.gl';
import { WEB_SOCKET } from '@/constants';
import lodash from 'lodash';
import qs from 'qs';

let prarms = qs.parse(lodash.split(window.location.search, '?')[1]);
export default new XVIZStreamLoader({
  logGuid: prarms.fileUrl ? prarms.fileUrl : 'none',
  bufferLength: 300,
  duration: 60,
  serverConfig: {
    serverUrl: WEB_SOCKET
  },
  worker: true,
  maxConcurrency: 4
});
