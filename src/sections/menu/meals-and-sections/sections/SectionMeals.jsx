import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useParams } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  Card,
  Stack,
  Button,
  Avatar,
  Switch,
  Divider,
  Tooltip,
  useTheme,
  FormGroup,
  IconButton,
  CardHeader,
  Typography,
  FormControlLabel,
} from '@mui/material';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import { titleCase } from 'src/utils/change-case';
import AddMealDrawer from 'src/sections/menu/meals-and-sections/drawers/add-meal-drawer';
import RemoveMealDialog from 'src/sections/menu/meals-and-sections/dialogs/remove-meal-dialog';
import EditPricesDrawer from 'src/sections/menu/meals-and-sections/drawers/edit-prices-drawer';
import RemoveSectionDialog from 'src/sections/menu/meals-and-sections/dialogs/remove-section-dialog';
import EditSectionTitleDrawer from 'src/sections/menu/meals-and-sections/drawers/edit-section-title-drawer';

// ----------------------------------------------------------------------

SectionMeals.propTypes = {
  id: PropTypes.string,
  isLast: PropTypes.bool,
  isFirst: PropTypes.bool,
  sectionInfo: PropTypes.object,
  allMeals: PropTypes.array,
  allSections: PropTypes.array,
};

export default function SectionMeals({ id, isLast, isFirst, sectionInfo, allMeals, allSections }) {
  const { id: menuID } = useParams();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { fsUpdateSection, fsUpdateSectionsOrder } = useAuthContext();
  const [dialogsState, setDialogsState] = useState({
    addMeal: false,
    removeSection: false,
    editSectionTitle: false,
    prices: false,
    removeMeal: false,
  });
  const [selectedMealInfo, setSelectedMealInfo] = useState(null);

  // TODO: fix this error by using a better way to filter meals
  const sectionMeals = allMeals.filter((meal) =>
    sectionInfo.meals.some((sectionMeal) => sectionMeal.docID === meal.docID)
  );

  const { mutate, isPending, isError } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
    onSuccess: () => {
      queryClient.invalidateQueries(['sections', menuID]);
    },
  });

  const openEditPricesDrawer = (meal) => {
    setSelectedMealInfo(meal);
    handleDialogIsOpenState('prices', true);
  };

  const openDeleteMealDialog = (meal) => {
    setSelectedMealInfo(meal);
    handleDialogIsOpenState('removeMeal', true);
  };

  const handleStatusChange = () =>
    mutate(() => fsUpdateSection(menuID, sectionInfo.docID, { isActive: !sectionInfo.isActive }));

  const handleShiftSectionUp = () => {
    const affectedSection = allSections.find((section) => section.order === sectionInfo.order - 1);
    mutate(() =>
      fsUpdateSectionsOrder(
        menuID,
        sectionInfo.docID,
        sectionInfo.order - 1,
        affectedSection.docID,
        sectionInfo.order
      )
    );
  };

  const handleShiftSectionDown = () => {
    const affectedSection = allSections.find((section) => section.order === sectionInfo.order + 1);
    mutate(() =>
      fsUpdateSectionsOrder(
        menuID,
        sectionInfo.docID,
        sectionInfo.order + 1,
        affectedSection.docID,
        sectionInfo.order
      )
    );
  };

  const handleDialogIsOpenState = (dialogName, isOpen) => {
    setDialogsState((state) => ({ ...state, [dialogName]: isOpen }));
  };

  return (
    <>
      <Card
        sx={{ my: 2, border: !sectionInfo.isActive && `dashed 1px ${theme.palette.error.main}` }}
      >
        <CardHeader
          title={titleCase(sectionInfo.title)}
          sx={{ backgroundColor: 'background.neutral', py: 1, px: 2 }}
          action={
            <FormGroup row>
              <FormControlLabel
                labelPlacement="start"
                label={
                  !sectionInfo.isActive && (
                    <Label color="error" variant="filled">
                      Section is Hidden
                    </Label>
                  )
                }
                control={
                  <Switch
                    onChange={handleStatusChange}
                    checked={sectionInfo?.isActive}
                    color="success"
                  />
                }
              />
              <Tooltip title="delete section">
                <IconButton
                  color="error"
                  size="small"
                  onClick={() => handleDialogIsOpenState('removeSection', true)}
                >
                  <Iconify icon="f7:trash" width={22} height={22} />
                </IconButton>
              </Tooltip>

              {!isFirst && (
                <Tooltip title="move up">
                  <IconButton
                    // color="background.default"
                    size="small"
                    onClick={handleShiftSectionUp}
                    disabled={isPending && isError}
                    sx={{ color: 'common.alternative' }}
                  >
                    <Iconify icon="akar-icons:circle-chevron-up" width={22} height={22} />
                  </IconButton>
                </Tooltip>
              )}

              {!isLast && (
                <Tooltip title="move down">
                  <IconButton
                    size="small"
                    onClick={handleShiftSectionDown}
                    sx={{ color: 'common.alternative' }}
                  >
                    <Iconify icon="akar-icons:circle-chevron-down" width={22} height={22} />
                  </IconButton>
                </Tooltip>
              )}

              <Tooltip title="edit section name">
                <IconButton
                  sx={{ color: 'common.alternative' }}
                  size="small"
                  onClick={() => handleDialogIsOpenState('editSectionTitle', true)}
                >
                  <Iconify icon="clarity:edit-line" width={22} height={22} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Add/Remove Meal">
                <IconButton
                  sx={{ color: 'common.alternative' }}
                  size="small"
                  onClick={() => handleDialogIsOpenState('addMeal', true)}
                >
                  <Iconify icon="mdi:hamburger-plus" width={22} height={22} />
                </IconButton>
              </Tooltip>
            </FormGroup>
          }
        />

        <Stack spacing={1} sx={{ p: 2 }} divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
          {sectionMeals.length === 0 && (
            <Stack direction="row" alignItems="center" justifyContent="center">
              <Typography>Add meals to section</Typography>
              <IconButton
                sx={{ color: 'common.alternative' }}
                size="small"
                onClick={() => handleDialogIsOpenState('addMeal', true)}
              >
                <Iconify icon="mdi:hamburger-plus" width={22} height={22} />
              </IconButton>
            </Stack>
          )}

          {sectionMeals
            .sort((a, b) => a.title.localeCompare(b.title))
            .map((meal, index) => (
              <Stack
                key={meal.docID}
                direction="row"
                alignItems="center"
                sx={{ filter: !sectionInfo.isActive ? 'grayscale(1)' : '' }}
                divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
                spacing={1}
              >
                <Avatar
                  src={meal.cover}
                  alt={meal.title}
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 0.5,
                    mr: 1,
                    filter: `grayscale(${meal.isActive ? 0 : '100'})`,
                  }}
                  variant="square"
                />
                <Stack direction="column" spacing={0.25} sx={{ px: 1, flexGrow: 1 }}>
                  <Typography variant="subtitle2">{meal.title}</Typography>
                  <Stack direction="row" spacing={2}>
                    {sectionInfo.meals
                      .find((sectionMeal) => sectionMeal.docID === meal.docID)
                      .portions.map((portion, i) => (
                        <Label variant="soft" color="warning" key={`${portion.portionSize}-${i}`}>
                          {portion.portionSize} - {portion.price}
                        </Label>
                      ))}
                  </Stack>
                  {!meal.isActive && (
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1 }}>
                      <Iconify icon="ep:warning-filled" sx={{ color: 'error.main' }} />
                      <Typography variant="caption" color="error">
                        Meal is disabled in all menus
                      </Typography>
                    </Stack>
                  )}
                </Stack>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ flexShrink: 1, justifyContent: 'flex-end' }}
                >
                  <Button
                    variant="soft"
                    color="warning"
                    size="small"
                    onClick={() => openEditPricesDrawer(meal)}
                    startIcon={<Iconify icon="ic:outline-attach-money" />}
                  >
                    Edit Prices
                  </Button>
                  <Button
                    variant="soft"
                    color="error"
                    size="small"
                    onClick={() => openDeleteMealDialog(meal)}
                    startIcon={<Iconify icon="f7:trash" />}
                  >
                    Remove Meal
                  </Button>
                </Stack>
              </Stack>
            ))}
        </Stack>
      </Card>

      <AddMealDrawer
        isOpen={dialogsState.addMeal}
        onClose={() => handleDialogIsOpenState('addMeal', false)}
        sectionID={id}
        allMeals={allMeals}
      />
      <RemoveSectionDialog
        isOpen={dialogsState.removeSection}
        onClose={() => handleDialogIsOpenState('removeSection', false)}
        sectionInfo={sectionInfo}
      />
      <EditSectionTitleDrawer
        isOpen={dialogsState.editSectionTitle}
        onClose={() => handleDialogIsOpenState('editSectionTitle', false)}
        sectionID={sectionInfo.docID}
      />
      <EditPricesDrawer
        isOpen={dialogsState.prices}
        onClose={() => handleDialogIsOpenState('prices', false)}
        sectionInfo={sectionInfo}
        mealInfo={selectedMealInfo}
      />

      <RemoveMealDialog
        isOpen={dialogsState.removeMeal}
        onClose={() => handleDialogIsOpenState('removeMeal', false)}
        sectionInfo={sectionInfo}
        mealInfo={selectedMealInfo}
      />
    </>
  );
}
