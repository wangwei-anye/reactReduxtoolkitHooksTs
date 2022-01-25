import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { AppThunk, RootState } from '../../models/store';
import { getDataApi } from '@/services/login';

interface CounterState {
  value: number;
  list: Array<object>;
}

const initialState: CounterState = {
  value: 999,
  list: []
};

export const getData = createAsyncThunk('counter/getData', async () => {
  const { data } = await getDataApi();
  return data.data;
});

export const counterSlice = createSlice({
  name: 'counter',
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
    },
    [getData.rejected.type](state, err) {
      console.log(err);
    },
    [getData.pending.type](state) {
      console.log('进行中');
    }
  }
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;

export const incrementAsync =
  (amount: number): AppThunk =>
  (dispatch) => {
    setTimeout(() => {
      dispatch(incrementByAmount(amount));
    }, 1000);
  };

export const selectCount = (state: RootState) => state.counter;

export default counterSlice.reducer;
