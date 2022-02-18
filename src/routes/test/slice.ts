import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { AppThunk, RootState } from '../../models/store';
import { getDataApi } from '@/services/login';

interface taskState {
  value: number;
  list: Array<object>;
  loading: boolean;
}

const initialState: taskState = {
  value: 999,
  list: [],
  loading: false
};

export const getData = createAsyncThunk('task/getData', async () => {
  const { data } = await getDataApi();
  return data.data;
});

export const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    }
  },
  extraReducers: {
    [getData.fulfilled.type](state, { payload }) {
      payload.list.map((item: any, index: number) => {
        item.key = index;
        return item;
      });
      state.list = payload.list;
      state.loading = false;
    },
    [getData.rejected.type](state, err) {
      console.log(err);
    },
    [getData.pending.type](state) {
      state.loading = true;
    }
  }
});

export const { increment, decrement, incrementByAmount } = taskSlice.actions;

export const incrementAsync =
  (amount: number): AppThunk =>
  (dispatch) => {
    setTimeout(() => {
      dispatch(incrementByAmount(amount));
    }, 1000);
  };

export const selectTask = (state: RootState) => state.task;

export default taskSlice.reducer;
