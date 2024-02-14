import { m } from 'framer-motion';
import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Stack } from '@mui/system';
import {
  Box,
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
import { MotionViewport } from 'src/components/animate';

// ----------------------------------------------------------------------

AddMealDialog.propTypes = {
  onClose: PropTypes.func,
  isOpen: PropTypes.bool,
  sectionID: PropTypes.string,
  allMeals: PropTypes.array,
};

function AddMealDialog({ onClose, isOpen, sectionID, allMeals }) {
  const { id: menuID } = useParams();
  const { fsGetSections } = useAuthContext();

  const { data: menuSections = [] } = useQuery({
    queryKey: [`sections-${menuID}`],
    queryFn: () => fsGetSections(menuID),
  });

  const currentSectionInfo = menuSections.filter((section) => section.docID === sectionID)[0];
  const currentSectionMeals = currentSectionInfo?.meals;
  const otherSectionsMeals = menuSections
    .filter((section) => section.docID !== sectionID)
    .flatMap((section) => section.meals.flatMap((meal) => meal.mealID))
    .filter((mealID) => !currentSectionMeals.includes(mealID));

  const sectionAvailableMeals = allMeals.filter((meal) => !otherSectionsMeals.includes(meal.docID));

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
        <MotionViewport>
          <Stack
            direction="column"
            spacing={0.5}
            sx={{ mb: 2, pl: 2 }}
            divider={
              <Divider
                variant="fullWidth"
                orientation="horizontal"
                sx={{ borderStyle: 'dashed' }}
              />
            }
          >
            {sectionAvailableMeals
              .sort((a, b) => a.title.localeCompare(b.title))
              .map((meal) => (
                <m.div
                  key={meal.docID}
                  whileHover={{
                    paddingLeft: '15px',
                  }}
                >
                  <MealRow
                    mealInfo={meal}
                    currentSectionMeals={currentSectionMeals}
                    sectionID={sectionID}
                    menuID={menuID}
                  />
                </m.div>
              ))}
          </Stack>
        </MotionViewport>
      </DialogContent>
    </Dialog>
  );
}

export default AddMealDialog;

// ----------------------------------------------------------------------------

MealRow.propTypes = {
  mealInfo: PropTypes.object,
  currentSectionMeals: PropTypes.array,
  menuID: PropTypes.string,
  sectionID: PropTypes.string,
};

function MealRow({ mealInfo, currentSectionMeals, menuID, sectionID }) {
  console.log(currentSectionMeals);
  const { fsUpdateSection } = useAuthContext();
  const queryClient = useQueryClient();

  const { isPending, mutate } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
    onSuccess: () => {
      const queryKeys = [`sections-${menuID}`];
      queryClient.invalidateQueries(queryKeys);
    },
  });

  const handleAddMealToSection = (mealID) => {
    // if mealID DOES exists, Remove it
    if (currentSectionMeals.flatMap((meal) => meal.mealID).includes(mealID))
      mutate(() =>
        fsUpdateSection(menuID, sectionID, {
          meals: currentSectionMeals.filter((sectionMeal) => sectionMeal.mealID !== mealID),
        })
      );

    // if mealID DOES NOT exists, Add it
    if (!currentSectionMeals.flatMap((meal) => meal.mealID).includes(mealID))
      mutate(() =>
        fsUpdateSection(menuID, sectionID, {
          meals: [...currentSectionMeals, { mealID, isActive: mealInfo.isActive }],
        })
      );
  };

  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Avatar src={mealInfo.cover} sx={{ width: 32, height: 32 }} />

      <Box sx={{ flexGrow: 1, ml: 2, minWidth: 100 }}>
        <Typography variant="subtitle2">{mealInfo.title}</Typography>
      </Box>

      {isPending && <CircularProgress />}
      {!isPending && (
        <IconButton onClick={() => handleAddMealToSection(mealInfo.docID)}>
          {currentSectionMeals.flatMap((meal) => meal.mealID)?.includes(mealInfo.docID) ? (
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
