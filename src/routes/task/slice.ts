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
    }
  }
});
export const { clearList } = taskSlice.actions;
export const selectTask = (state: RootState) => state.task;

export default taskSlice.reducer;
