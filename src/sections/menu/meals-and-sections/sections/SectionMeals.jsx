import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
  Box,
  Card,
  Stack,
  Avatar,
  Divider,
  Tooltip,
  IconButton,
  CardHeader,
  Typography,
} from '@mui/material';

import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import { titleCase } from 'src/utils/change-case';
import { rdxMoveSectionUp, rdxMoveSectionDown } from 'src/redux/slices/menu';
import AddMealDialog from 'src/sections/menu/meals-and-sections/dialogs/add-meal-dialog';
import VisibilityDialog from 'src/sections/menu/meals-and-sections/dialogs/visibility-dialog';
import EditSectionTitleDialog from 'src/sections/menu/meals-and-sections/dialogs/edit-section-title-dialog';

import TranslationDialog from '../dialogs/translation-dialog';

// ----------------------------------------------------------------------

SectionMeals.propTypes = {
  id: PropTypes.string,
  dense: PropTypes.bool,
  isLast: PropTypes.bool,
  isFirst: PropTypes.bool,
  sectionInfo: PropTypes.object,
  allMeals: PropTypes.array,
};

// TODO: sort meals alphabetically
// TODO: translate sections titles
// TODO: toggle between section titles locales
// TODO: show menu preview

export default function SectionMeals({ id, dense, isLast, isFirst, sectionInfo, allMeals }) {
  const dispatch = useDispatch();
  const { id: menuID } = useParams();
  const { user, fsUpdateSectionOrder } = useAuthContext();
  const [dialogsState, setDialogsState] = useState({
    addMeal: false,
    removeSection: false,
    editSectionTitle: false,
    translation: false,
    visibility: false,
  });

  const availableMealsForSelection = allMeals.filter((meal) => sectionInfo.meals.includes(meal));

  const languagesLength = user?.languages?.length || 0;

  const [targetSection, affectedSection] = useSelector((state) => state.menu.sectionsReorderIDs);

  useEffect(() => {
    if (targetSection) {
      fsUpdateSectionOrder(targetSection.menuID, targetSection.id, targetSection.order);
      fsUpdateSectionOrder(affectedSection.menuID, affectedSection.id, affectedSection.order);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetSection]);

  // ------------------------------- REORDER SECTIONS ---------------------------------------------
  const shiftSectionDownHandler = () => {
    dispatch(rdxMoveSectionDown({ menuID, sectionID: id }));
  };
  const shiftSectionUpHandler = () => {
    dispatch(rdxMoveSectionUp({ menuID, sectionID: id }));
  };

  const handleDialogIsOpenState = (dialogName, isOpen) => {
    setDialogsState((state) => ({ ...state, [dialogName]: isOpen }));
  };

  const { isVisible } = sectionInfo;

  return (
    <>
      <Card sx={{ my: 2 }}>
        <CardHeader
          title={titleCase(sectionInfo.title)}
          subheader={sectionInfo.isVisible ? '' : 'Section is Hidden'}
          action={
            <>
              {!isFirst && (
                <Tooltip title="move up">
                  <IconButton color="secondary" size="small" onClick={shiftSectionUpHandler}>
                    <Iconify icon="akar-icons:circle-chevron-up" width={22} height={22} />
                  </IconButton>
                </Tooltip>
              )}

              {!isLast && (
                <Tooltip title="move down">
                  <IconButton color="secondary" size="small" onClick={shiftSectionDownHandler}>
                    <Iconify icon="akar-icons:circle-chevron-down" width={22} height={22} />
                  </IconButton>
                </Tooltip>
              )}

              <Tooltip title="delete section">
                <IconButton
                  color="error"
                  size="small"
                  onClick={() => handleDialogIsOpenState('removeSection', true)}
                >
                  <Iconify icon="ci:trash-empty" width={22} height={22} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Show/Edit Section Translation">
                <IconButton
                  color="primary"
                  size="small"
                  onClick={() => handleDialogIsOpenState('translation', true)}
                >
                  <Iconify icon="cil:language" width={22} height={22} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Visibility">
                <IconButton
                  color="primary"
                  size="small"
                  onClick={() => handleDialogIsOpenState('visibility', true)}
                >
                  <Iconify icon="ic:round-access-time" width={22} height={22} />
                </IconButton>
              </Tooltip>

              <Tooltip title="edit section name">
                <IconButton
                  color="primary"
                  size="small"
                  onClick={() => handleDialogIsOpenState('editSectionTitle', true)}
                >
                  <Iconify icon="clarity:edit-line" width={22} height={22} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Add/Remove Meal">
                <IconButton
                  color="primary"
                  size="small"
                  onClick={() => handleDialogIsOpenState('addMeal', true)}
                >
                  <Iconify icon="mdi:hamburger-plus" width={22} height={22} />
                </IconButton>
              </Tooltip>
            </>
          }
        />

        <Stack spacing={2} sx={{ p: 2 }}>
          {availableMealsForSelection.length === 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              Please add meals from the top right corner action button
              <Iconify icon="mdi:hamburger-plus" width={22} height={22} sx={{ ml: 1 }} />
            </Box>
          )}

          {availableMealsForSelection.map((meal, index) => (
            <React.Fragment key={meal.id}>
              <Stack
                direction="row"
                alignItems="center"
                sx={{ filter: !isVisible ? 'grayscale(1) blur(1px)' : '' }}
              >
                <Avatar src={meal.cover.url} alt={meal.title} sx={{ width: 56, height: 56 }} />
                <Box sx={{ flexGrow: 1, ml: 2, minWidth: 100 }}>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    {meal.title}
                  </Typography>

                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {meal.description}
                  </Typography>
                </Box>
              </Stack>
              {availableMealsForSelection.length > 1 &&
                index + 1 !== availableMealsForSelection.length && (
                  <Divider sx={{ borderStyle: 'dashed' }} />
                )}
            </React.Fragment>
          ))}
        </Stack>
      </Card>

      {dialogsState.addMeal && (
        <AddMealDialog
          isOpen={dialogsState.addMeal}
          onClose={() => handleDialogIsOpenState('addMeal', false)}
          sectionID={id}
          allMeals={allMeals}
        />
      )}
      {/* {dialogsState.removeSection && (
        <RemoveSectionDialog
          isOpen={dialogsState.removeSection}
          onClose={() => handleDialogIsOpenState('removeSection', false)}
          sectionID={id}
          sectionInfo={sectionInfo}
          menuMeals={menuMeals}
        />
      )} */}
      {dialogsState.editSectionTitle && (
        <EditSectionTitleDialog
          isOpen={dialogsState.editSectionTitle}
          onClose={() => handleDialogIsOpenState('editSectionTitle', false)}
          sectionID={id}
        />
      )}
      {dialogsState.translation && (
        <TranslationDialog
          isOpen={dialogsState.translation}
          onClose={() => handleDialogIsOpenState('translation', false)}
          sectionID={id}
          languagesLength={languagesLength}
        />
      )}
      {dialogsState.visibility && (
        <VisibilityDialog
          isOpen={dialogsState.visibility}
          onClose={() => handleDialogIsOpenState('visibility', false)}
          sectionID={id}
        />
      )}
    </>
  );
}
