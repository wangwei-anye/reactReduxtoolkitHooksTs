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
  const result = [];
  if (data.code === 200) {
    for (let i = 0; i < data.data.length; i++) {
      result.push({
        title: data.data[i].name,
        key: data.data[i].id,
        isEditable: false
      });
    }
  }
  return result;
});
export const getListData = createAsyncThunk('caseLib/getListData', async (query) => {
  const { data } = await getListApi(query);
  if (data.code === 200) {
    for (let i = 0; i < data.data.records.length; i++) {
      data.data.records[i].key = i;
    }
  }
  return data;
});

const addChildrenFile = (data: Array<object>, key: string) => {
  return data.map((item: any) => {
    if (item.key === key) {
      if (item.children) {
        let maxKey = 0;
        item.children.forEach((item: any) => {
          maxKey = Math.max(maxKey, item.key.split('-').pop());
        });

        item.children.push({
          title: 'new' + item.key + '-' + (maxKey + 1),
          key: item.key + '-' + (maxKey + 1),
          isEditable: false
        });
      } else {
        item.children = [
          {
            title: 'new' + item.key + '-0',
            key: item.key + '-0',
            isEditable: false
          }
        ];
      }
    } else {
      if (item.children) {
        addChildrenFile(item.children, key);
      }
    }
    return item;
  });
};
const deleteChildrenFile = (data: Array<object>, key: string) => {
  const keyArr = key.split('-');
  if (keyArr.length === 1) {
    const parentKey = keyArr[0];
    return data.filter((item: any) => {
      return item.key !== parentKey;
    });
  } else {
    keyArr.pop();
    const parentKey = keyArr.join('-');

    return data.map((item: any) => {
      if (item.key === parentKey) {
        if (item.children) {
          item.children = item.children.filter((item: any) => {
            return item.key !== key;
          });
        }
      } else {
        if (item.children) {
          deleteChildrenFile(item.children, key);
        }
      }
      return item;
    });
  }
};
const editSuccessFileHandle = (data: Array<object>, txt: string) => {
  return data.map((item: any) => {
    if (item.isEditable) {
      item.isEditable = false;
      item.title = txt;
    }
    if (item.children) {
      editSuccessFileHandle(item.children, txt);
    }
    return item;
  });
};
const editStartFileHandle = (data: Array<object>, key: string) => {
  return data.map((item: any) => {
    if (item.key === key) {
      item.isEditable = true;
    }
    if (item.children) {
      editStartFileHandle(item.children, key);
    }
    return item;
  });
};
export const caseLibSlice = createSlice({
  name: 'caseLib',
  initialState,
  reducers: {
    createFile: (state, action: PayloadAction<string>) => {
      state.treeData = addChildrenFile(state.treeData, action.payload);
    },
    deleteFile: (state, action: PayloadAction<string>) => {
      state.treeData = deleteChildrenFile(state.treeData, action.payload);
    },
    editSuccessFile: (state, action: PayloadAction<string>) => {
      state.treeData = editSuccessFileHandle(state.treeData, action.payload);
    },
    editStartFile: (state, action: PayloadAction<string>) => {
      state.treeData = editStartFileHandle(state.treeData, action.payload);
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
export const { createFile, deleteFile, editSuccessFile, editStartFile } = caseLibSlice.actions;
export const selectCaseLib = (state: RootState) => state.caseLib;

export default caseLibSlice.reducer;
