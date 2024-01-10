import { current, createSlice } from '@reduxjs/toolkit';

// ----------------------------------------------------------------------

const initialState = {
  waiterInfo: {
    id: '',
    displayName: '',
    isActive: '',
    userCode: '',
    password: '',
    lastLogin: '',
  },
  tables: [],
  menuSections: [],
  selectedTable: {},
  selectedTableCart: {},
  meals: [],
};

const slice = createSlice({
  name: 'waiter',
  initialState,
  reducers: {
    rdxGetWaiterInfo(state, action) {
      state.waiterInfo = action.payload;
    },
    rdxGetMenuMeals(state, action) {
      state.meals = action.payload;
    },
    rdxGetMenuSections(state, action) {
      state.menuSections = action.payload;
    },
    rdxGetTableInfo(state, action) {
      state.tableInfo = action.payload;
    },

    rdxInitiateTable(state, action) {
      const tableIndex = state.tables.findIndex((table) => table.tableID === action.payload.tableID);

      if (tableIndex === -1)
        state.tables = [
          ...state.tables,
          { tableID: action.payload.tableID, cartItems: [], isPaid: false, status: 'EMPTY' },
        ];
    },

    rdxSetSelectedTable(state, action) {
      state.selectedTable = action.payload;
    },

    rdxAddMealToCart(state, action) {
      const { meal, selectedPortionSize } = action.payload;
      const tableIndex = state.tables.findIndex((table) => table.tableID === state.selectedTable.id);
      const existingMealIndex = state.tables[tableIndex].cartItems.findIndex((cartMeal) => cartMeal.id === meal.id);

      if (existingMealIndex === -1) {
        const cart = state.tables[tableIndex].cartItems;
        state.tables[tableIndex].cartItems = [...cart, { ...meal, size: [{ ...selectedPortionSize, qty: 1 }] }];
      }

      if (existingMealIndex !== -1) {
        const portionIndex = state.tables[tableIndex].cartItems[existingMealIndex].size.findIndex(
          (portion) => portion.portionSize === selectedPortionSize.portionSize
        );
        const portions = state.tables[tableIndex].cartItems[existingMealIndex].size;
        if (portionIndex !== -1) state.tables[tableIndex].cartItems[existingMealIndex].size[portionIndex].qty += 1;
        if (portionIndex === -1)
          state.tables[tableIndex].cartItems[existingMealIndex].size = [
            ...portions,
            { ...selectedPortionSize, qty: 1 },
          ];
      }
    },

    rdxRemoveMealFromCart(state, action) {
      // const { meal, selectedPortionSize } = action.payload;
      // const existingMealIndex = state.cart.findIndex((item) => item.id === meal.id);
      // TODO: add ID to portion size to identify the portion instead of using portionSize Name
      const { meal, selectedPortionSize } = action.payload;

      const tableIndex = state.tables.findIndex((table) => table.tableID === state.selectedTable.id);
      const mealIndex = state.tables[tableIndex].cartItems.findIndex((cartMeal) => cartMeal.id === meal.id);

      // if meal not in the cart, don't do anything and exit
      if (mealIndex === -1) return;

      const portionIndex = state.tables[tableIndex].cartItems[mealIndex].size.findIndex(
        (size) => size.portionSize === selectedPortionSize.portionSize
      );

      const portion = state.tables[tableIndex].cartItems[mealIndex].size[portionIndex];
      if (!portion?.qty) return;

      if (portion.qty > 1) {
        state.tables[tableIndex].cartItems[mealIndex].size[portionIndex].qty -= 1;
      } else {
        state.tables[tableIndex].cartItems[mealIndex].size = state.tables[tableIndex].cartItems[mealIndex].size.filter(
          (size) => size.portionSize !== portion.portionSize
        );
      }

      // check if meal has no added portions and remove it from cart
      if (state.tables[tableIndex].cartItems[mealIndex].size.length === 0)
        state.tables[tableIndex].cartItems = state.tables[tableIndex].cartItems.filter(
          (cartItem) => cartItem.id !== meal.id
        );
    },

    rdxEmptyCart(state) {
      const tableIndex = state.tables.findIndex((table) => table.tableID === state.selectedTable.id);
      state.tables[tableIndex].cartItems = [];
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const {
  rdxGetWaiterInfo,
  rdxSetSelectedTable,
  rdxInitiateTable,
  rdxAddMealToCart,
  rdxRemoveMealFromCart,
  rdxGetMenuMeals,
  rdxGetMenuSections,
  rdxGetTableInfo,
  rdxEmptyCart,
} = slice.actions;
