import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk, RootState } from '../../models/store';

interface CounterState {
  value: number;
}

const initialState: CounterState = {
  value: 999
};

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
