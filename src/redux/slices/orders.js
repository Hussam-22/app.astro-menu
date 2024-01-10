import { current, createSlice } from '@reduxjs/toolkit';

// ----------------------------------------------------------------------

const initialState = {
  order: {},
  orders: [],
  isLoading: false,
  // forceUpdate value is only to force useEffect to re-run by toggling it between true and force, forceUpdate value does not mean anything
  forceUpdate: false,
};

const slice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    rdxLogger(state) {
      console.log(current(state));
    },

    rdxGetOrderByID(state, action) {
      state.order = state.orders.find((order) => order.id === action.payload);
    },

    rdxGetOrdersList(state, action) {
      state.orders = action.payload;
    },

    rdxToggleForceUpdate(state) {
      state.forceUpdate = !state.forceUpdate;
    },

    rdxStartLoading(state) {
      state.isLoading = true;
    },

    rdxStopLoading(state) {
      state.isLoading = false;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const {
  rdxLogger,
  rdxGetOrderByID,
  rdxGetOrdersList,
  rdxStartLoading,
  rdxStopLoading,
  rdxGetBranchTables,
  rdxToggleForceUpdate,
} = slice.actions;
