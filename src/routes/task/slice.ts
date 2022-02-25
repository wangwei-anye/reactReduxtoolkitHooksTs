import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { AppThunk, RootState } from '../../models/store';
import { getListApi } from '@/services/task';

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
    for (let i = 0; i < data.data.records.length; i++) {
      data.data.records[i].key = i;
      data.data.records[i].name = '测试任务' + i;
      data.data.records[i].state = '已完成';
    }
  }
  return data;
});

export const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {},
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

export const selectTask = (state: RootState) => state.task;

export default taskSlice.reducer;
