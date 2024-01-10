import { current, createSlice } from '@reduxjs/toolkit';

// ----------------------------------------------------------------------

const initialState = {
  menu: { sections: [], meals: [] },
  menus: [],
  sectionInfo: {},
  isLoading: false,
  newMenuID: '',
  sectionsReorderIDs: [], // [targetSection,next/previousSection]
};

const slice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    rdxSetNewMenuID(state, action) {
      state.newMenuID = action.payload;
    },
    rdxRemoveNewMenuID(state) {
      state.newMenuID = '';
    },

    rdxGetSectionInfo(state, action) {
      state.sectionInfo = {};
      state.sectionInfo = { ...action.payload };
    },

    // GET SELECTED MENU
    rdxGetMenu(state, action) {
      state.menu = { ...state.menu, ...action.payload };
    },

    // GET ALL MENUS
    rdxGetAllMenu(state, action) {
      state.menus = action.payload;
      // return { ...state, ...action.payload };
    },

    rdxUpdateMenusList(state, action) {
      state.menus = [...state.menus, action.payload];
    },

    rdxAddSection(state, action) {
      state.menu.sections = [
        ...state.menu.sections,
        {
          title: action.payload.title,
          id: action.payload.sectionID,
          menuID: action.payload.menuID,
          userID: action.payload.useID,
          meals: [],
          order: action.payload.order,
          isVisible: true,
          activeTimeRange: { isActive: false, from: '', to: '' },
          activeDateRange: { isActive: false, from: '', to: '' },
        },
      ];
    },

    rdxGetMenuSections(state, action) {
      state.menu = { ...state.menu, sections: action.payload };
    },

    rdxUpdateMenuSection(state, action) {
      const indexOfToUpdateSection = state.menu.sections.findIndex(
        (section) => section.id === action.payload.id
      );
      state.menu.sections[indexOfToUpdateSection] = action.payload;
    },

    rdxUpdateSectionMeals(state, action) {
      state.isLoading = false;
      const indexOfToUpdateSection = state.menu.sections.findIndex(
        (section) => section.id === action.payload.sectionID
      );
      state.menu.sections[indexOfToUpdateSection].meals = action.payload.meals;
    },

    rdxUpdateSectionTranslationAfterTitleEdit(state, action) {
      // GET TARGET SECTION
      const indexOfToUpdateSection = state.menu.sections.findIndex(
        (section) => section.id === action.payload.sectionID
      );
      const section = state.menu.sections[indexOfToUpdateSection];

      // delete section['translationEdited'];
      // delete section['translation'];
      delete section.translationEdited;
      delete section.translation;

      state.menu.sections[indexOfToUpdateSection] = section;
    },

    rdxUpdateSectionTranslation(state, action) {
      state.isLoading = false;
      // GET TARGET SECTION
      const indexOfToUpdateSection = state.menu.sections.findIndex(
        (section) => section.id === action.payload.sectionID
      );
      const section = state.menu.sections[indexOfToUpdateSection];

      // Object.assign(section.translationEdited, { [action.payload.key]: action.payload.value });
      // section.translationEdited = { ...section.translationEdited, [action.payload.key]: action.payload.value };
      // state.menu.sections[indexOfToUpdateSection] = section;
      state.menu.sections[indexOfToUpdateSection].translationEdited[action.payload.key] =
        action.payload.value;
    },

    rdxResetSectionTranslationSingleLanguage(state, action) {
      state.isLoading = false;
      // GET TARGET SECTION
      const indexOfToUpdateSection = state.menu.sections.findIndex(
        (section) => section.id === action.payload.sectionID
      );
      const section = state.menu.sections[indexOfToUpdateSection];
      section.translationEdited = {
        ...section.translationEdited,
        [action.payload.key]: section.translation[action.payload.key],
      };
      state.menu.sections[indexOfToUpdateSection] = section;
    },

    rdxUpdateMenuSectionTitle(state, action) {
      state.isLoading = false;
      // GET TARGET SECTION
      const indexOfToUpdateSection = state.menu.sections.findIndex(
        (section) => section.id === action.payload.sectionID
      );
      state.menu.sections[indexOfToUpdateSection].title = action.payload.title;
    },

    rdxUpdateMenuMeals(state, action) {
      state.isLoading = false;

      // GET TARGET MENU
      const mealsArr = state.menu.meals;
      if (action.payload.type === 'add') state.meals = [...mealsArr, action.payload.mealID];
      if (action.payload.type === 'remove')
        state.meals = [...mealsArr].filter((meal) => meal !== action.payload.mealID);
    },

    rdxToggleSectionVisibility(state, action) {
      // GET TARGET SECTION
      const indexOfToUpdateSection = state.menu.sections.findIndex(
        (section) => section.id === action.payload.sectionID
      );
      const sectionIsVisible = state.menu.sections[indexOfToUpdateSection].isVisible;
      state.menu.sections[indexOfToUpdateSection].isVisible = !sectionIsVisible;
    },

    rdxSetSectionActiveTimeRange(state, action) {
      // GET TARGET SECTION
      const indexOfToUpdateSection = state.menu.sections.findIndex(
        (section) => section.id === action.payload.sectionID
      );
      state.menu.sections[indexOfToUpdateSection].activeTimeRange = {
        isActive: true,
        from: action.payload.from,
        to: action.payload.to,
      };
    },

    rdxRemoveSectionActiveTimeRange(state, action) {
      // GET TARGET SECTION
      const indexOfToUpdateSection = state.menu.sections.findIndex(
        (section) => section.id === action.payload.sectionID
      );
      state.menu.sections[indexOfToUpdateSection].activeTimeRange.isActive = false;
    },

    rdxDeleteMenuSection(state, action) {
      // REMOVE DELETED MEALS FROM MENU SELECTED MEALS
      const menuSelectedMeals = state.menu.meals;

      state.meals = menuSelectedMeals.filter(
        (mealID) => !action.payload.sectionMeals.includes(mealID)
      );

      // REMOVE SECTION FROM SECTIONS ARRAY
      const menuSections = state.menu.sections;
      const { order: targetSectionOrder } = menuSections.find(
        (section) => section.id === action.payload.sectionID
      );

      const filteredSections = menuSections.filter(
        (section) => section.id !== action.payload.sectionID
      );

      state.menu.sections = [...filteredSections];

      // RE-ORDER MENU SECTIONS AFTER DELETING SECTION
      state.menu.sections = filteredSections.map((section) => {
        const updatedOrder = section.order - 1;
        if (section.order > targetSectionOrder) return { ...section, order: updatedOrder };
        return section;
      });
    },

    rdxDeleteAllSections(state, action) {
      // GET TARGET MENU
      const indexOfToUpdateMenu = state.menus.findIndex(
        (menu) => menu.id === action.payload.menuID
      );
      state.menus[indexOfToUpdateMenu].meals = [];
      state.menus[indexOfToUpdateMenu].sections = [];
    },

    rdxMoveSectionDown(state, action) {
      let targetSection = state.menu.sections.find(
        (section) => section.id === action.payload.sectionID
      );

      const targetSectionOrder = targetSection.order;

      let nextTargetSection = state.menu.sections.find(
        (section) => section.order === targetSectionOrder + 1
      );

      targetSection = { ...targetSection, order: targetSectionOrder + 1 };
      nextTargetSection = { ...nextTargetSection, order: targetSectionOrder };

      const filterOutIDs = [targetSection.id, nextTargetSection.id];

      const updatedSections = state.menu.sections.filter(
        (section) => !filterOutIDs.some((id) => id === section.id)
      );

      state.menu.sections = [...updatedSections, targetSection, nextTargetSection];
      state.sectionsReorderIDs = [targetSection, nextTargetSection];
    },

    rdxMoveSectionUp(state, action) {
      let targetSection = state.menu.sections.find(
        (section) => section.id === action.payload.sectionID
      );

      const targetSectionOrder = targetSection.order;

      let previousTargetSection = state.menu.sections.find(
        (section) => section.order === targetSectionOrder - 1
      );

      targetSection = { ...targetSection, order: targetSectionOrder - 1 };
      previousTargetSection = { ...previousTargetSection, order: targetSectionOrder };

      const filterOutIDs = [targetSection.id, previousTargetSection.id];

      const updatedSections = state.menu.sections.filter(
        (section) => !filterOutIDs.some((id) => id === section.id)
      );

      state.menu.sections = [...updatedSections, targetSection, previousTargetSection];
      state.sectionsReorderIDs = [targetSection, previousTargetSection];
    },

    rdxMenuStateLogger(state) {
      console.log(current(state.menus));
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const {
  rdxSetNewMenuID,
  rdxRemoveNewMenuID,
  rdxGetMenu,
  rdxGetAllMenu,
  rdxAddSection,
  rdxGetMenuSections,
  rdxUpdateMenuSection,
  rdxUpdateMenuMeals,
  rdxUpdateSectionMeals,
  rdxDeleteMenuSection,
  rdxUpdateMenuSectionTitle,
  rdxUpdateSectionTranslationAfterTitleEdit,
  rdxUpdateSectionTranslation,
  rdxResetSectionTranslationSingleLanguage,
  rdxMoveSectionDown,
  rdxMoveSectionUp,
  rdxToggleSectionVisibility,
  rdxSetSectionActiveTimeRange,
  rdxRemoveSectionActiveTimeRange,
  rdxDeleteAllSections,
  rdxUpdateMenusList,
  rdxGetSectionInfo,
} = slice.actions;
