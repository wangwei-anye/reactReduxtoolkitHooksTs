import { XVIZStreamLoader } from 'streetscape.gl';
import { WEB_SOCKET } from '@/constants';

export default new XVIZStreamLoader({
  logGuid: 'replay/template-236.json' || 'mock',
  bufferLength: 300,
  duration: 60,
  serverConfig: {
    serverUrl: 'ws://localhost:6555'
  },
  worker: true,
  maxConcurrency: 4
});
