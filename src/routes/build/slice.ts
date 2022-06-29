import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { getListApi } from '@/services/build';
import { RootState } from '../../models/store';
interface buildState {
  listData: object;
  loading: boolean;
}

const initialState: buildState = {
  listData: {
    records: [],
    total: 0
  },
  loading: false
};

export const getData = createAsyncThunk('build/getData', async (query) => {
  const { data } = await getListApi(query);
  return data;
});

export const buildSlice = createSlice({
  name: 'build',
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
export const { clearList } = buildSlice.actions;
export const selectBuild = (state: RootState) => state.build;

export default buildSlice.reducer;
