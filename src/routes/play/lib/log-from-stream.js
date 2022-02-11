import { XVIZStreamLoader } from 'streetscape.gl';
import { WEB_SOCKET } from '@/constants';

export default new XVIZStreamLoader({
  logGuid: 'replay/template-222.json' || 'mock',
  bufferLength: 300,
  duration: 60,
  serverConfig: {
    serverUrl: WEB_SOCKET
  },
  worker: true,
  maxConcurrency: 4
});
