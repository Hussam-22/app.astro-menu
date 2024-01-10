import { current, createSlice } from '@reduxjs/toolkit';

// ----------------------------------------------------------------------

const initialState = {
  staffsList: [],
  staffInfo: {},
  lastStaffAccessCodeID: 0,
};

const slice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    rdxLogger(state) {
      console.log(current(state));
    },

    rdxGetStaffsList(state, action) {
      state.staffsList = [...action.payload];
    },

    rdxGetStaffInfo(state, action) {
      state.staffInfo = { ...action.payload };
    },

    rdxUpdateWaitersList(state, action) {
      const newStaffsList = state.staffsList.filter((staff) => staff.id !== action.payload.id);
      state.staffsList = [...newStaffsList, action.payload];
    },

    rdxGetLastStaffAccessCodeID(state, action) {
      state.lastStaffAccessCodeID = action.payload;
    },

    rdxIncrementLastStaffAccessCodeID(state) {
      state.lastStaffAccessCodeID += 1;
    },
    rdxDeleteWaiter(state, action) {
      const newStaffList = state.staffsList.filter((staff) => staff.id !== action.payload);
      state.staffsList = [...newStaffList];
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const {
  rdxLogger,
  rdxGetStaffsList,
  rdxGetStaffInfo,
  rdxGetLastStaffAccessCodeID,
  rdxIncrementLastStaffAccessCodeID,
  rdxDeleteWaiter,
  rdxUpdateWaitersList,
} = slice.actions;
