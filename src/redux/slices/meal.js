import { current, createSlice } from '@reduxjs/toolkit';

// ----------------------------------------------------------------------

const initialState = {
  meals: [],
  meal: {},
  isLoading: false,
  newMealID: '',
};

const slice = createSlice({
  name: 'meal',
  initialState,
  reducers: {
    rdxLogger(state) {
      console.log(current(state));
    },

    rdxGetAllMeals(state, action) {
      state.meals = [...action.payload];
    },

    rdxSetNewMealID(state, action) {
      state.newMealID = action.payload;
    },

    rdxUnSetNewMealID(state) {
      state.newMealID = '';
    },

    rdxStartLoading(state) {
      state.isLoading = true;
    },

    rdxStopLoading(state) {
      state.isLoading = false;
    },

    rdxGetMeal(state, action) {
      state.meal = action.payload;
    },

    rdxUpdateTranslation_Meal(state, action) {
      const { key, keyValue, languageKey } = action.payload;
      state.meal.translationEdited = {
        ...state.meal.translationEdited,
        [languageKey]: { ...state.meal.translationEdited[languageKey], [key]: keyValue },
      };
    },

    rdxResetTranslation_Meal(state, action) {
      const { key, languageKey } = action.payload;

      state.meal.translationEdited[languageKey] = {
        ...state.meal.translationEdited[languageKey],
        [key]: state.meal.translation[languageKey][key],
      };
    },

    updateMealTitle(state, action) {
      state.isLoading = true;
      state.meal = {
        ...state.meal,
        title: action.payload.title,
        description: action.payload.description,
      };
    },

    rdxRemoveMeal(state, action) {
      state.meals = [...state.meals.filter((meal) => meal.id !== action.payload)];
    },

    rdxResetMeal() {
      return initialState;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const {
  rdxLogger,
  rdxGetAllMeals,
  rdxGetMeal,
  updateMealTitle,
  updateMealTranslationAfterTitleEdit,
  rdxUpdateTranslation_Meal,
  rdxResetTranslation_Meal,
  rdxResetMeal,
  rdxStopLoading,
  rdxStartLoading,
  rdxSetNewMealID,
  rdxUnSetNewMealID,
  rdxRemoveMeal,
} = slice.actions;
