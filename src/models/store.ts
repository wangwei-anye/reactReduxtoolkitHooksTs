import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import taskReducer from '../routes/task/slice';
import caseLibReducer from '../routes/caseLib/slice';

export const store = configureStore({
  reducer: {
    task: taskReducer,
    caseLib: caseLibReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
