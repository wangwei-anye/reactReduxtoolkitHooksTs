import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import taskReducer from '../routes/task/slice';

export const store = configureStore({
  reducer: {
    task: taskReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
