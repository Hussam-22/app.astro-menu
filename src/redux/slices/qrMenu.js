import { current, createSlice } from '@reduxjs/toolkit';

// ----------------------------------------------------------------------

const initialState = {
  cart: [],
  tableInfo: {},
  isLoading: false,
  menuSections: [],
  menuMeals: [],
  filteredMeals: [],
  filterKeywords: {},
  resetKeywords: false, // just to trigger useEffect in QRMenu component to re-get metaKeywords
  sectionTitlesRefs: [],
  scrollTo: undefined,
  defaultLanguage: '',
  selectedLanguage: '',
  languages: [],
  order: {},
  orderStatus: '',
};

const slice = createSlice({
  name: 'qrMenu',
  initialState,
  reducers: {
    rdxGetTableInfo(state, action) {
      state.tableInfo = action.payload;
    },

    rdxGetMenuMeals(state, action) {
      state.menuMeals = action.payload;
    },

    rdxGetMenuSections(state, action) {
      state.menuSections = action.payload;
    },

    rdxGetOrder(state, action) {
      state.order = action.payload;
      if (action.payload?.status.closed !== '') {
        state.orderStatus = 'Cancelled';
        return;
      }
      if (action.payload?.status.paid !== '') {
        state.orderStatus = 'Paid';
        return;
      }
      if (action.payload?.status.ready !== '') {
        state.orderStatus = 'Ready to serve';
        return;
      }
      if (action.payload?.status.kitchen !== '') {
        state.orderStatus = 'Preparing';
        return;
      }
      if (action.payload?.status.initial !== '') {
        state.orderStatus = 'Taking Order';
      }
    },

    rdxUpdateCart(state, action) {
      state.cart = action.payload;
    },

    rdxSetFilterKeywords(state, action) {
      action.payload.forEach((element) => {
        state.filterKeywords = { ...state.filterKeywords, [element]: false };
      });
    },

    rdxToggleFilterKeyword(state, action) {
      state.filterKeywords[action.payload] = !state.filterKeywords[action.payload];
    },

    rdxResetKeywords(state) {
      state.resetKeywords = !state.resetKeywords;
    },

    rdxAddFilteredMeals(state, action) {
      state.filteredMeals = action.payload;
    },

    rdxResetFilter(state) {
      state.filteredMeals = [];
      state.sectionTitlesRefs = [];
    },

    rdxAddSectionTitleRef(state, action) {
      state.sectionTitlesRefs = [...state.sectionTitlesRefs, action.payload];
    },

    rdxScrollTo(state, action) {
      state.scrollTo = action.payload;
    },

    rdxGetUserLanguages(state, action) {
      state.languages = [action.payload.defaultLanguage, ...action.payload.languages];
      state.selectedLanguage = action.payload.defaultLanguage;
      state.defaultLanguage = action.payload.defaultLanguage;
    },

    rdxChangeLanguage(state, action) {
      state.selectedLanguage = action.payload;
    },

    rdxStartLoading(state) {
      state.isLoading = true;
    },

    rdxStopLoading(state) {
      state.isLoading = false;
    },

    // rdxAddMealToCart(state, action) {
    //   const { meal, selectedPortionSize } = action.payload;

    //   const existingMealIndex = state.cart.findIndex((item) => item.id === meal.id);

    //   if (existingMealIndex === -1)
    //     state.cart = [...state.cart, { ...meal, cart: [{ ...selectedPortionSize, qty: 1 }] }];

    //   if (existingMealIndex !== -1) {
    //     const cartIndex = state.cart[existingMealIndex].cart.findIndex(
    //       (portion) => portion.portionSize === selectedPortionSize.portionSize
    //     );
    //     const cartArr = state.cart[existingMealIndex].cart;
    //     if (cartIndex !== -1) state.cart[existingMealIndex].cart[cartIndex].qty += 1;
    //     if (cartIndex === -1) state.cart[existingMealIndex].cart = [...cartArr, { ...selectedPortionSize, qty: 1 }];
    //   }
    // },

    // rdxRemoveMealFromCart(state, action) {
    //   const { meal, selectedPortionSize } = action.payload;
    //   const storeCart = state.cart;
    //   const mealIndex = storeCart.findIndex((cartMeal) => cartMeal.id === meal.id);
    //   const portionIndex = storeCart[mealIndex].portions.findIndex(
    //     (portion) => portion.portionSize === selectedPortionSize.portionSize
    //   );

    //   if (state.cart[mealIndex].portions[portionIndex].qty === 0) return;
    //   state.cart[mealIndex].portions[portionIndex].qty -= 1;

    //   // const { meal, selectedPortionSize } = action.payload;

    //   // const existingMealIndex = state.cart.findIndex((item) => item.id === meal.id);

    //   // const cartIndex = state.cart[existingMealIndex].cart.findIndex(
    //   //   (portion) => portion.portionSize === selectedPortionSize.portionSize
    //   // );
    //   // if (cartIndex === -1) return;
    //   // const mealPortion = state.cart[existingMealIndex].cart[cartIndex];
    //   // const { qty } = mealPortion;
    //   // if (qty === 0) return;

    //   // if (qty === 1) {
    //   //   state.cart[existingMealIndex].cart[cartIndex].qty -= 1;
    //   //   state.cart[existingMealIndex].cart = state.cart[existingMealIndex].cart.filter(
    //   //     (cartItem) => cartItem.portionSize !== mealPortion.portionSize
    //   //   );
    //   // } else state.cart[existingMealIndex].cart[cartIndex].qty -= 1;

    //   // // check if meal has no added portions and remove it from cart
    //   // const mealTotalAddedPortions = state.cart[existingMealIndex].cart.reduce(
    //   //   (accum, current) => accum + current.qty,
    //   //   0
    //   // );
    //   // if (mealTotalAddedPortions === 0)
    //   //   state.cart = state.cart.filter((meal) => meal.id !== state.cart[existingMealIndex].id);
    // },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const {
  rdxLogger,
  rdxGetTableInfo,
  rdxGetMenuMeals,
  rdxStopLoading,
  rdxGetBranchTables,
  rdxGetMenuSections,
  rdxAddFilteredMeals,
  rdxSetFilterKeywords,
  rdxToggleFilterKeyword,
  rdxResetKeywords,
  rdxAddSectionTitleRef,
  rdxScrollTo,
  rdxResetFilter,
  rdxChangeLanguage,
  rdxGetUserLanguages,
  rdxGetOrder,
  rdxUpdateCart,
} = slice.actions;
