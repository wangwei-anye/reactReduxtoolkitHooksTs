import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { AppThunk, RootState } from '../../models/store';
import { getTreeDataApi, getMenuDataApi } from '@/services/caseLib';

interface caseLibState {
  treeData: Array<object>;
  loading: boolean;
}

const initialState: caseLibState = {
  treeData: [],
  loading: false
};

export const getTreeData = createAsyncThunk('caseLib/getTreeData', async () => {
  const data = await getTreeDataApi();
  return data;
});

export const getMenuData = createAsyncThunk('caseLib/getMenuData', async () => {
  const data = await getMenuDataApi();
  console.log(data);
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
const editSuccessFileHadnle = (data: Array<object>, txt: string) => {
  return data.map((item: any) => {
    if (item.isEditable) {
      item.isEditable = false;
      item.title = txt;
    }
    if (item.children) {
      editSuccessFileHadnle(item.children, txt);
    }
    return item;
  });
};
const editStartFileHadnle = (data: Array<object>, key: string) => {
  return data.map((item: any) => {
    if (item.key === key) {
      item.isEditable = true;
    }
    if (item.children) {
      editStartFileHadnle(item.children, key);
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
      state.treeData = editSuccessFileHadnle(state.treeData, action.payload);
    },
    editStartFile: (state, action: PayloadAction<string>) => {
      state.treeData = editStartFileHadnle(state.treeData, action.payload);
    }
  },
  extraReducers: {
    [getTreeData.fulfilled.type](state, { payload }) {
      state.treeData = payload;
    },
    [getTreeData.rejected.type](state, err) {
      console.log(111111111);
    },
    [getTreeData.pending.type](state) {}
  }
});
export const { createFile, deleteFile, editSuccessFile, editStartFile } = caseLibSlice.actions;
export const selectCaseLib = (state: RootState) => state.caseLib;

export default caseLibSlice.reducer;
