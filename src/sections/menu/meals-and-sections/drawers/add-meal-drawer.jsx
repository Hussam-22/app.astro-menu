import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  Box,
  Stack,
  Avatar,
  Drawer,
  Divider,
  Skeleton,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
} from '@mui/material';

import Image from 'src/components/image';
import Iconify from 'src/components/iconify';
import { delay } from 'src/utils/promise-delay';
// _mock
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

AddMealDrawer.propTypes = {
  onClose: PropTypes.func,
  isOpen: PropTypes.bool,
  sectionID: PropTypes.string,
  allMeals: PropTypes.array,
};

function AddMealDrawer({ onClose, isOpen, sectionID, allMeals }) {
  const { id: menuID } = useParams();
  const { menuSections, fsGetMenu } = useAuthContext();
  const queryClient = useQueryClient();
  const [searchKeyword, setSearchKeyword] = useState('');

  const { data: menuInfo = {} } = useQuery({
    queryKey: ['menu', menuID],
    queryFn: () => fsGetMenu(menuID),
  });

  const currentSectionInfo = menuSections.filter((section) => section.docID === sectionID)[0];
  const currentSectionMeals = currentSectionInfo?.meals;

  const otherSectionsMeals = menuSections
    .filter((section) => section.docID !== sectionID)
    .flatMap((section) => section.meals.flatMap((meal) => meal))
    .filter(
      (mealID) =>
        !currentSectionMeals.map((currentSectionMeal) => currentSectionMeal.docID).includes(mealID)
    );

  const sectionAvailableMeals = allMeals.filter(
    (meal) =>
      !otherSectionsMeals
        .map((otherSectionsMeal) => otherSectionsMeal.docID)
        .includes(meal.docID) && meal.isActive
  );

  const filteredMeals = useMemo(
    () =>
      sectionAvailableMeals.filter((meal) =>
        meal.title.toLowerCase().includes(searchKeyword.toLowerCase())
      ),
    [searchKeyword, sectionAvailableMeals]
  );

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={() => {
        setSearchKeyword('');
        onClose();
      }}
      PaperProps={{
        sx: { borderRadius: '25px 0 0 25px', width: { xs: '75%', sm: '45%', md: '25%' } },
      }}
    >
      <Box sx={{ bgcolor: 'secondary.main', p: 2 }}>
        <Typography variant="caption" color="white">
          Add Meals to Section
        </Typography>
        <Typography variant="h6" color="primary">
          {currentSectionInfo?.title}
        </Typography>
      </Box>

      <TextField
        label="Search Meals"
        sx={{ mx: 2, mt: 2 }}
        onChange={(e) => setSearchKeyword(e.target.value)}
      />

      {filteredMeals.length === 0 && (
        <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ p: 2 }}>
          <Image src="/assets/illustrations/dashboard/cutlery-fork.svg" width={100} />
          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            All Meals are selected by other sections or your search returned nothing
          </Typography>
        </Stack>
      )}
      <Stack
        direction="column"
        spacing={0.5}
        sx={{ p: 3 }}
        divider={
          <Divider variant="fullWidth" orientation="horizontal" sx={{ borderStyle: 'dashed' }} />
        }
      >
        {queryClient.isMutating(['sections', menuInfo.docID]) !== 0 &&
          [...Array(filteredMeals.length)].map((_, index) => (
            <Stack
              direction="row"
              key={index}
              sx={{ height: 32, my: 0.5 }}
              spacing={1}
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={1} flexGrow={1}>
                <Skeleton variant="circular" sx={{ height: 32, width: 32 }} />
                <Skeleton variant="text" sx={{ width: 1 }} />
              </Stack>
              <Skeleton variant="circular" sx={{ height: 24, width: 24, my: 0.5, mx: 0.85 }} />
            </Stack>
          ))}
        {queryClient.isMutating(['sections', menuInfo.docID]) === 0 &&
          filteredMeals
            .sort((a, b) => a.title.localeCompare(b.title))
            .map((meal) => (
              <Box key={meal.docID}>
                <MealRow
                  mealInfo={meal}
                  currentSectionMeals={currentSectionMeals}
                  sectionID={sectionID}
                  menuInfo={menuInfo}
                />
              </Box>
            ))}
      </Stack>
    </Drawer>
  );
}

export default AddMealDrawer;

// ----------------------------------------------------------------------------

MealRow.propTypes = {
  mealInfo: PropTypes.object,
  currentSectionMeals: PropTypes.array,
  menuInfo: PropTypes.object,
  sectionID: PropTypes.string,
};

function MealRow({ mealInfo, currentSectionMeals, menuInfo, sectionID }) {
  const { fsUpdateSection, fsUpdateMenu } = useAuthContext();
  const queryClient = useQueryClient();

  const { isPending, mutate, error } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
    onSuccess: () => {
      queryClient.invalidateQueries(['sections', menuInfo.docID]);
      queryClient.invalidateQueries(['menu', menuInfo.docID]);
    },
  });

  const handleAddMealToSection = (meal) => {
    if (currentSectionMeals.map((sectionMeal) => sectionMeal.docID).includes(meal.docID)) {
      // remove meal from section
      const filteredMeals = currentSectionMeals.find(
        (sectionMeal) => sectionMeal.docID === meal.docID
      );
      const updatedMeals = currentSectionMeals.filter(
        (currentSectionMeal, index) => currentSectionMeal.docID !== filteredMeals.docID
      );

      mutate(async () => {
        await fsUpdateSection(menuInfo.docID, sectionID, {
          meals: updatedMeals,
          mealsQueryArray: updatedMeals.map((mealItem) => mealItem.docID),
        });
        await delay(100);
      });
    }

    if (!currentSectionMeals.map((sectionMeal) => sectionMeal.docID).includes(meal.docID)) {
      // add meal to section
      mutate(async () => {
        await fsUpdateSection(menuInfo.docID, sectionID, {
          meals: [...currentSectionMeals, meal],
          mealsQueryArray: [...currentSectionMeals.map((mealItem) => mealItem.docID), meal.docID],
        });
        await delay(100);
      });
    }
  };

  return (
    <Stack direction="row" alignItems="center" spacing={1} justifyContent="space-between">
      <Avatar src={mealInfo.cover} sx={{ width: 32, height: 32 }} />
      <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
        {mealInfo.title}
      </Typography>

      {isPending && <CircularProgress size={21} sx={{ mx: 1 }} />}
      {!isPending && (
        <IconButton
          onClick={() =>
            handleAddMealToSection({
              docID: mealInfo.docID,
              isActive: mealInfo.isActive,
              portions: mealInfo.portions,
              isNew: mealInfo.isNew,
            })
          }
        >
          {currentSectionMeals.flatMap((meal) => meal.docID)?.includes(mealInfo.docID) ? (
            <Iconify icon="mdi:minus-circle" width={24} height={24} sx={{ color: 'error.main' }} />
          ) : (
            <Iconify
              icon="ic:sharp-add-circle"
              width={24}
              height={24}
              sx={{ color: 'success.main' }}
            />
          )}
        </IconButton>
      )}
    </Stack>
  );
}
