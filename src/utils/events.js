import { EventEmitter } from 'events';

export const TASK_REFRESH = 'TASK_REFRESH';

// NOTE: 构建单例
export default new EventEmitter();
