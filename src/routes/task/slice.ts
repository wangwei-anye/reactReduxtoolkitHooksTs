import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { getListApi } from '@/services/task';
import { STATE_DOING, STATE_COMPLETE, STATE_PASSS, STATE_QUEUE } from './constants';
import { AppThunk, RootState } from '../../models/store';
interface taskState {
  listData: object;
  loading: boolean;
}

const initialState: taskState = {
  listData: {
    records: [],
    total: 0
  },
  loading: false
};

export const getData = createAsyncThunk('task/getData', async (query) => {
  const { data } = await getListApi(query);
  if (data.code === 200) {
    let totalDoing = 0;
    let totalQueue = 0;
    if (!data.data.records) {
      data.data.records = [];
    }
    for (let i = 0; i < data.data.records.length; i++) {
      let completeNum = 0;
      let errorNum = 0;
      let doingNum = 0;
      if (data.data.records[i].children) {
        for (let j = 0; j < data.data.records[i].children.length; j++) {
          if (data.data.records[i].children[j].state === STATE_DOING) {
            totalDoing++;
            doingNum++;
          } else if (data.data.records[i].children[j].state === STATE_QUEUE) {
            totalQueue++;
          } else if (
            data.data.records[i].children[j].state === STATE_COMPLETE ||
            data.data.records[i].children[j].state === STATE_PASSS
          ) {
            completeNum++;
          } else {
            errorNum++;
          }
        }
      }
      data.data.records[i].totalNum = data.data.records[i].children.length;
      data.data.records[i].completeNum = completeNum;
      data.data.records[i].doingNum = doingNum;
      data.data.records[i].errorNum = errorNum;
    }
    data.data.doingNum = totalDoing;
    data.data.totalQueue = totalQueue;
  }
  return data;
});

export const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    clearList: (state) => {
      state.listData = {
        records: [],
        total: 0
      };
    }
  },
  extraReducers: {
    [getData.fulfilled.type](state, { payload }) {
      // state.loading = false;
      state.listData = payload.data;
    },
    [getData.rejected.type](state, err) {
      console.log(err);
    },
    [getData.pending.type](state) {
      // state.loading = true;
      //会渲染2次
    }
  }
});
export const { clearList } = taskSlice.actions;
export const selectTask = (state: RootState) => state.task;

export default taskSlice.reducer;
