import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useParams } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  Box,
  Card,
  Stack,
  Switch,
  Avatar,
  Tooltip,
  Divider,
  useTheme,
  FormGroup,
  Typography,
  CardHeader,
  IconButton,
  FormControlLabel,
} from '@mui/material';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import { titleCase } from 'src/utils/change-case';
import TextMaxLine from 'src/components/text-max-line';
import AddMealDialog from 'src/sections/menu/meals-and-sections/dialogs/add-meal-dialog';
import RemoveSectionDialog from 'src/sections/menu/meals-and-sections/dialogs/remove-section-dialog';
import EditSectionTitleDialog from 'src/sections/menu/meals-and-sections/dialogs/edit-section-title-dialog';

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
  const theme = useTheme();
  const { id: menuID } = useParams();
  const { fsUpdateSection, fsUpdateSectionsOrder } = useAuthContext();
  const queryClient = useQueryClient();
  const [dialogsState, setDialogsState] = useState({
    addMeal: false,
    removeSection: false,
    editSectionTitle: false,
    visibility: false,
  });

  const sectionMeals = allMeals.filter(
    (meal) => sectionInfo.meals.some((sectionMeal) => sectionMeal.mealID === meal.docID)
    // sectionInfo.meals.some((sectionMeal) => sectionMeal === meal.docID)
  );

  const { mutate, isPending, isError } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
    onSuccess: () => {
      queryClient.invalidateQueries([`sections-${menuID}`]);
    },
  });

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

  const onMealStatusChange = (mealID) => {
    const { meals: sectionMealsInfo } = sectionInfo;
    const index = sectionMealsInfo.findIndex((meal) => meal.mealID === mealID);
    const updatedMeals = sectionMealsInfo;
    updatedMeals[index].isActive = !sectionMealsInfo[index].isActive;

    mutate(() => fsUpdateSection(menuID, sectionInfo.docID, { meals: updatedMeals }));
  };

  return (
    <>
      <Card
        sx={{ my: 2, border: !sectionInfo.isActive && `dashed 1px ${theme.palette.error.main}` }}
      >
        <CardHeader
          title={titleCase(sectionInfo.title)}
          sx={{ backgroundColor: 'background.neutral', pb: 2 }}
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
                control={<Switch onChange={handleStatusChange} checked={sectionInfo?.isActive} />}
              />
              <Tooltip title="delete section">
                <IconButton
                  color="error"
                  size="small"
                  onClick={() => handleDialogIsOpenState('removeSection', true)}
                >
                  <Iconify icon="ci:trash-empty" width={22} height={22} />
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

        <Stack spacing={1} sx={{ p: 2 }}>
          {sectionMeals.length === 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              Please add meals from the top right corner action button
              <Iconify icon="mdi:hamburger-plus" width={22} height={22} sx={{ ml: 1 }} />
            </Box>
          )}

          {sectionMeals
            .sort((a, b) => a.title.localeCompare(b.title))
            .map((meal, index) => (
              <React.Fragment key={meal.docID}>
                <Stack
                  direction="row"
                  alignItems="center"
                  sx={{ filter: !sectionInfo.isActive ? 'grayscale(1)' : '' }}
                  divider={
                    <Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />
                  }
                >
                  <Stack direction="column" spacing={1} sx={{ maxWidth: '10%' }}>
                    <Box sx={{ position: 'relative', mr: 1 }}>
                      <Avatar
                        src={meal.cover}
                        alt={meal.title}
                        sx={{
                          width: 72,
                          height: 72,
                          borderRadius: 1,

                          filter: `grayscale(${meal.isActive ? 0 : '100'})`,
                        }}
                        variant="square"
                      />
                    </Box>
                  </Stack>
                  <Stack
                    direction="column"
                    sx={{ px: 2, maxWidth: '75%' }}
                    spacing={1}
                    flexGrow={1}
                  >
                    <Box>
                      {/* <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {meal.docID}
                      </Typography> */}
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
                  <Stack
                    direction="column"
                    spacing={1}
                    alignItems="center"
                    sx={{ maxWidth: '20%' }}
                  >
                    <FormControlLabel
                      control={
                        <Switch
                          color="success"
                          disabled={!meal.isActive || !sectionInfo.isActive}
                          checked={
                            sectionInfo.meals.find(
                              (sectionMeal) => sectionMeal.mealID === meal.docID
                            )?.isActive
                          }
                          onChange={() => onMealStatusChange(meal.docID)}
                        />
                      }
                      labelPlacement="bottom"
                      label="Change Meal Status on menu"
                      sx={{ textAlign: 'center' }}
                    />
                    {!meal.isActive && (
                      <Label
                        variant="filled"
                        color="error"
                        sx={{
                          // position: 'absolute',
                          // bottom: -10,
                          // left: '50%',
                          // transform: 'translateX(-50%)',
                          fontSize: 11,
                          fontWeight: '200',
                        }}
                      >
                        Meal Level Disable
                      </Label>
                    )}
                  </Stack>
                </Stack>
                {sectionMeals.length > 1 && index + 1 !== sectionMeals.length && (
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
    </>
  );
}
