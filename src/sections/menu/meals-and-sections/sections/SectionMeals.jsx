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

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import { titleCase } from 'src/utils/change-case';
import TextMaxLine from 'src/components/text-max-line';
import { rdxMoveSectionUp, rdxMoveSectionDown } from 'src/redux/slices/menu';
import AddMealDialog from 'src/sections/menu/meals-and-sections/dialogs/add-meal-dialog';
import VisibilityDialog from 'src/sections/menu/meals-and-sections/dialogs/visibility-dialog';
import RemoveSectionDialog from 'src/sections/menu/meals-and-sections/dialogs/remove-section-dialog';
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

  const availableMealsForSelection = allMeals.filter((meal) =>
    sectionInfo.meals.includes(meal.docID)
  );

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

  return (
    <>
      <Card sx={{ my: 2 }}>
        <CardHeader
          title={titleCase(sectionInfo.title)}
          subheader={sectionInfo.isActive ? '' : 'Section is Hidden'}
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

        <Stack spacing={1} sx={{ p: 2 }}>
          {availableMealsForSelection.length === 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              Please add meals from the top right corner action button
              <Iconify icon="mdi:hamburger-plus" width={22} height={22} sx={{ ml: 1 }} />
            </Box>
          )}

          {availableMealsForSelection
            .sort((a, b) => a.title.localeCompare(b.title))
            .map((meal, index) => (
              <React.Fragment key={meal.docID}>
                <Stack
                  direction="row"
                  alignItems="center"
                  sx={{ filter: !sectionInfo.isActive ? 'grayscale(1)' : '' }}
                >
                  <Avatar
                    src={meal.cover}
                    alt={meal.title}
                    sx={{ width: 72, height: 72, borderRadius: 1 }}
                    variant="square"
                  />
                  <Stack direction="column" sx={{ px: 2 }} spacing={1}>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {meal.docID}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
                        {meal.title}
                      </Typography>
                      <TextMaxLine line={1} variant="body2">
                        {meal.description}
                      </TextMaxLine>
                    </Box>
                    <Stack direction="row" spacing={2}>
                      {meal.portions.map((portion, i) => (
                        <Label variant="soft" color="warning" key={`${portion.portionSize}-${i}`}>
                          {portion.portionSize} - {portion.gram}g - ${portion.price}
                        </Label>
                      ))}
                    </Stack>
                  </Stack>
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
      {dialogsState.removeSection && (
        <RemoveSectionDialog
          isOpen={dialogsState.removeSection}
          onClose={() => handleDialogIsOpenState('removeSection', false)}
          sectionInfo={sectionInfo}
        />
      )}
      {dialogsState.editSectionTitle && (
        <EditSectionTitleDialog
          isOpen={dialogsState.editSectionTitle}
          onClose={() => handleDialogIsOpenState('editSectionTitle', false)}
          sectionID={sectionInfo.docID}
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
