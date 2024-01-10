import { current, createSlice } from '@reduxjs/toolkit';

// ----------------------------------------------------------------------

const initialState = {
  branchesList: [],
  branch: {},
  tables: [],
  newBranchID: '',
  isLoading: false,
  // refresh value is only to force useEffect to re-run by toggling it between true and force, forceUpdate value does not mean anything
  refresh: false,
  requestDataUpdate: true,
};

const slice = createSlice({
  name: 'branch',
  initialState,
  reducers: {
    rdxLogger(state) {
      console.log(current(state));
    },

    rdxStartLoading(state) {
      state.isLoading = true;
    },

    rdxStopLoading(state) {
      state.isLoading = false;
    },

    rdxUpdateBranchesList(state, action) {
      // Drop target branch, then re-add it with new values
      const existingBranches = state.branchesList.filter((branch) => branch.id !== action.payload.id);
      state.branchesList = [...existingBranches, action.payload];
      state.branch = { ...action.payload };
    },

    rdxUpdateBranchDescription(state, action) {
      state.branch = { ...state.branch, description: action.payload };
    },

    rdxSetBranch(state, action) {
      state.branch = { ...action.payload };
    },

    rdxSetBranchByID(state, action) {
      state.branch = { ...state.branchesList.find((branch) => branch.id === action.payload) };
    },

    rdxGetBranchesList(state, action) {
      state.branchesList = action.payload;
    },

    rdxGetBranchTables(state, action) {
      state.tables = [];
      state.tables = action.payload;
    },

    rdxUpdateTable(state, action) {
      state.tables = state.tables.map((table) => ({ ...table, activeMenuID: action.payload }));
    },

    rdxUpdateTranslation_Branch(state, action) {
      const { key, keyValue, languageKey } = action.payload;
      state.branch.translationEdited = {
        ...state.branch.translationEdited,
        [languageKey]: { ...state.branch.translationEdited[languageKey], [key]: keyValue },
      };
    },

    rdxResetTranslation_Branch(state, action) {
      const { key, languageKey } = action.payload;

      state.branch.translationEdited[languageKey] = {
        ...state.branch.translationEdited[languageKey],
        [key]: state.branch.translation[languageKey][key],
      };
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const {
  rdxLogger,
  rdxGetBranchesList,
  rdxStartLoading,
  rdxStopLoading,
  rdxGetBranchTables,
  rdxUpdateTable,
  rdxUpdateTranslation_Branch,
  rdxResetTranslation_Branch,
  rdxUpdateBranchesList,
  rdxUpdateBranchDescription,
  rdxSetBranch,
  rdxSetBranchByID,
} = slice.actions;
