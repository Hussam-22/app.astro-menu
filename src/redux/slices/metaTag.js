import { current, createSlice } from '@reduxjs/toolkit';

// ----------------------------------------------------------------------

const initialState = {
  metaTagsList: [],
};

const slice = createSlice({
  name: 'metaTag',
  initialState,
  reducers: {
    rdxSetMetaTagsList(state, action) {
      state.metaTagsList = action.payload;
    },

    rdxUpdateMetaTag(state, action) {
      const filteredState = state.metaTagsList.filter((tag) => tag.id !== action.payload.id);
      state.metaTagsList = [...filteredState, action.payload];
    },

    rdxDeleteMetaTag(state, action) {
      const filteredState = state.metaTagsList.filter((tag) => tag.id !== action.payload);
      state.metaTagsList = [...filteredState];
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { rdxSetMetaTagsList, rdxUpdateMetaTag, rdxDeleteMetaTag } = slice.actions;
