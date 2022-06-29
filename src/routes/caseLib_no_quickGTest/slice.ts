import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { AppThunk, RootState } from '../../models/store';
import { getMenuDataApi, getListApi } from '@/services/caseLib';

interface caseLibState {
  treeData: Array<object>;
  listData: object;
  loading: boolean;
}

const initialState: caseLibState = {
  treeData: [],
  listData: {
    records: [],
    total: 0
  },
  loading: false
};

export const getMenuData = createAsyncThunk('caseLib/getMenuData', async () => {
  const { data } = await getMenuDataApi();
  let result: any = [];
  if (data.code === 200) {
    result = formatData(data.data);
  }
  return result;
});

const formatData: any = (data: any) => {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    result.push({
      title: data[i].name,
      key: data[i].id,
      readOnly: data[i].readOnly,
      isEditable: false,
      children: data[i].children ? formatData(data[i].children) : []
    });
  }
  return result;
};

export const getListData = createAsyncThunk('caseLib/getListData', async (query) => {
  const { data } = await getListApi(query);
  return data;
});

const editFileHandle = (data: Array<object>, key: string, isEditable: boolean) => {
  return data.map((item: any) => {
    if (item.key === key) {
      item.isEditable = isEditable;
    }
    if (item.children) {
      editFileHandle(item.children, key, isEditable);
    }
    return item;
  });
};
export const caseLibSlice = createSlice({
  name: 'caseLib',
  initialState,
  reducers: {
    editFile: (state, action: PayloadAction<any>) => {
      state.treeData = editFileHandle(
        state.treeData,
        action.payload.key,
        action.payload.isEditable
      );
    }
  },
  extraReducers: {
    [getMenuData.fulfilled.type](state, { payload }) {
      state.treeData = payload;
    },
    [getMenuData.rejected.type](state, err) {
      console.log('getMenuData rejected');
    },
    [getMenuData.pending.type](state) {},
    [getListData.fulfilled.type](state, { payload }) {
      state.listData = payload.data;
    },
    [getListData.rejected.type](state, err) {
      console.log('getListData rejected');
    },
    [getListData.pending.type](state) {}
  }
});
export const { editFile } = caseLibSlice.actions;
export const selectCaseLib = (state: RootState) => state.caseLib;

export default caseLibSlice.reducer;
