import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  Box,
  Stack,
  Dialog,
  Avatar,
  Divider,
  Typography,
  IconButton,
  DialogTitle,
  DialogContent,
  CircularProgress,
} from '@mui/material';

import Iconify from 'src/components/iconify';
// _mock
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

AddMealDialog.propTypes = {
  onClose: PropTypes.func,
  isOpen: PropTypes.bool,
  sectionID: PropTypes.string,
  allMeals: PropTypes.array,
};

function AddMealDialog({ onClose, isOpen, sectionID, allMeals }) {
  const { id: menuID } = useParams();
  const { menuSections, fsGetMenu } = useAuthContext();

  const { data: menuInfo = {} } = useQuery({
    queryKey: [`menu-${menuID}`],
    queryFn: () => fsGetMenu(menuID),
  });

  const currentSectionInfo = menuSections.filter((section) => section.docID === sectionID)[0];
  const currentSectionMeals = currentSectionInfo?.meals;
  const otherSectionsMeals = menuSections
    .filter((section) => section.docID !== sectionID)
    .flatMap((section) => section.meals.flatMap((meal) => meal))
    .filter((mealID) => !currentSectionMeals.includes(mealID));

  const sectionAvailableMeals = allMeals.filter(
    (meal) => !otherSectionsMeals.includes(meal.docID) && meal.isActive
  );

  return (
    <Dialog fullWidth maxWidth="sm" open={isOpen} onClose={onClose} scroll="paper">
      <IconButton sx={{ position: 'absolute', top: 15, right: 20 }} onClick={onClose}>
        <Iconify icon="material-symbols:close-rounded" />
      </IconButton>

      <DialogTitle>{currentSectionInfo?.title}</DialogTitle>

      <DialogContent>
        {sectionAvailableMeals.length === 0 && (
          <Typography variant="body1">
            All Meals are selected by other sections
            <Iconify icon="ic:twotone-error" width={22} height={22} sx={{ ml: 1 }} />
          </Typography>
        )}
        <Stack
          direction="column"
          spacing={0.5}
          sx={{ mb: 2, pl: 2 }}
          divider={
            <Divider variant="fullWidth" orientation="horizontal" sx={{ borderStyle: 'dashed' }} />
          }
        >
          {sectionAvailableMeals
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
      </DialogContent>
    </Dialog>
  );
}

export default AddMealDialog;

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
      queryClient.invalidateQueries([`sections-${menuInfo.docID}`]);
      queryClient.invalidateQueries([`menu-${menuInfo.docID}`]);
    },
  });

  const handleAddMealToSection = (mealID) => {
    const menuMeals = menuInfo?.meals || [];

    if (currentSectionMeals.includes(mealID)) {
      mutate(() =>
        fsUpdateSection(menuInfo.docID, sectionID, {
          meals: currentSectionMeals.filter((sectionMeal) => sectionMeal !== mealID),
        })
      );

      mutate(() => {
        const updateMeals = menuMeals.filter((meal) => meal !== mealID);
        fsUpdateMenu({ ...menuInfo, meals: updateMeals });
      });
    }

    if (!currentSectionMeals.includes(mealID)) {
      mutate(() =>
        fsUpdateSection(menuInfo.docID, sectionID, {
          meals: [...currentSectionMeals, mealID],
        })
      );

      mutate(() => {
        const updateMeals = [...menuMeals, mealID];
        fsUpdateMenu({ ...menuInfo, meals: updateMeals });
      });
    }
  };

  return (
    <Stack direction="row" alignItems="center" spacing={1} justifyContent="space-between">
      <Avatar src={mealInfo.cover} sx={{ width: 32, height: 32 }} />
      <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
        {mealInfo.title}
      </Typography>

      {isPending && <CircularProgress size={24} />}
      {!isPending && (
        <IconButton
          onClick={() =>
            handleAddMealToSection({
              mealID: mealInfo.docID,
              isActive: mealInfo.isActive,
              portions: mealInfo.portions,
              isNew: mealInfo.isNew,
            })
          }
        >
          {currentSectionMeals.flatMap((meal) => meal)?.includes(mealInfo.docID) ? (
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
