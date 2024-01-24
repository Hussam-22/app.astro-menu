import { useState } from 'react';
import { m } from 'framer-motion';
import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Stack,
  Avatar,
  Dialog,
  Divider,
  useTheme,
  IconButton,
  Typography,
  DialogTitle,
  DialogContent,
} from '@mui/material';

// _mock
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import { MotionViewport } from 'src/components/animate';
import { rdxUpdateMenuSection } from 'src/redux/slices/menu';

// ----------------------------------------------------------------------

AddMealDialog.propTypes = {
  onClose: PropTypes.func,
  isOpen: PropTypes.bool,
  sectionID: PropTypes.string,
  allMeals: PropTypes.array,
};

function AddMealDialog({ onClose, isOpen, sectionID, allMeals }) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { id: menuID } = useParams();
  const { fsUpdateSection } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const menuSections = useSelector((state) => state.menu.menu.sections);
  // -----------------------------------------------------------------------
  const currentSectionInfo = menuSections.filter((section) => section.id === sectionID)[0];
  const currentSectionMeals = currentSectionInfo.meals;
  const otherSectionsMeals = menuSections
    .flatMap((section) => section.meals)
    .filter((mealID) => !currentSectionMeals.includes(mealID));
  const sectionAvailableMeals = allMeals.filter((meal) => !otherSectionsMeals.includes(meal.id));
  // -----------------------------------------------------------------------

  const updateSectionMeals = (mealID) => {
    setIsLoading(true);
    if (currentSectionMeals.includes(mealID)) {
      // if mealID DOES exists, Remove it
      const updatedSection = {
        ...currentSectionInfo,
        meals: currentSectionMeals.filter((sectionMealID) => sectionMealID !== mealID),
      };
      dispatch(rdxUpdateMenuSection(updatedSection));
      fsUpdateSection(
        menuID,
        sectionID,
        currentSectionMeals.filter((sectionMealID) => sectionMealID !== mealID)
      );
    } else {
      // if mealID DOES NOT exists, Add it
      const updatedSection = { ...currentSectionInfo, meals: [...currentSectionMeals, mealID] };
      dispatch(rdxUpdateMenuSection(updatedSection));
      fsUpdateSection(menuID, sectionID, [...currentSectionMeals, mealID]);
    }
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={isOpen} onClose={onClose} scroll="paper">
      <IconButton sx={{ position: 'absolute', top: 15, right: 20 }} onClick={onClose}>
        <Iconify icon="material-symbols:close-rounded" />
      </IconButton>
      <DialogTitle>{currentSectionInfo.title}</DialogTitle>
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
                <m.div key={meal.id} whileHover={{ scale: 1.02 }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar src={meal.cover.url} sx={{ width: 32, height: 32 }} />

                    <Box sx={{ flexGrow: 1, ml: 2, minWidth: 100 }}>
                      <Typography variant="subtitle2">{meal.title}</Typography>
                    </Box>
                    <LoadingButton onClick={() => updateSectionMeals(meal.id)} loading={isLoading}>
                      {currentSectionMeals.includes(meal.id) ? (
                        <Iconify
                          icon="mdi:minus-circle"
                          width={24}
                          height={24}
                          sx={{ color: theme.palette.error.main }}
                        />
                      ) : (
                        <Iconify
                          icon="ic:sharp-add-circle"
                          width={24}
                          height={24}
                          sx={{ color: theme.palette.success.main }}
                        />
                      )}
                    </LoadingButton>
                  </Stack>
                </m.div>
              ))}
          </Stack>
        </MotionViewport>
      </DialogContent>
    </Dialog>
  );
}

export default AddMealDialog;
