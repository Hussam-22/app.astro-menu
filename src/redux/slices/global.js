import { createSlice } from '@reduxjs/toolkit';

// ----------------------------------------------------------------------

const initialState = {
  isOpen: false,
  passCode: '',
};

const slice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    rdxSetIsOpen(state, action) {
      state.isOpen = action.payload;
    },
    rdxSetPassCode(state, action) {
      state.passCode = action.payload;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { rdxSetIsOpen, rdxSetPassCode } = slice.actions;
