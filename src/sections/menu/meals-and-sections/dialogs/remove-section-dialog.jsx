import { useState } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import { useDispatch } from 'react-redux';

import { LoadingButton } from '@mui/lab';
import {
  Button,
  Dialog,
  Divider,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import { rdxDeleteMenuSection } from 'src/redux/slices/menu';

// ----------------------------------------------------------------------

RemoveSectionDialog.propTypes = {
  isOpen: PropTypes.bool,
  sectionID: PropTypes.string,
  onClose: PropTypes.func,
  sectionInfo: PropTypes.object,
  menuMeals: PropTypes.array,
};

/* 
! the problem : when you try to remove section, "RemoveSectionDialog" component is still mounted but its parent component "SectionMeals" was removed/unmounted,

react will rerender "RemoveSectionDialog" component after "deleteSectionHandler" is triggered, but when it reaches "useSelector", the section was already removed, and it cant retrieve data from the removed section
*/

function RemoveSectionDialog({ isOpen, sectionID, onClose, sectionInfo, menuMeals }) {
  const { menuID } = useParams();
  const dispatch = useDispatch();
  const { fsDeleteSection, fsRemoveSectionMealsFromMenuSelectedMeals } = useAuthContext();
  const [loading, setLoading] = useState(false);
  // const sectionInfo = useSelector((state) => state.menu.sections.filter((section) => section.id === sectionID)[0]);
  // const menuMeals = useSelector((state) => state.menu.meals);

  const deleteSectionHandler = () => {
    setLoading(true);

    const updatedMenuMeals = menuMeals.filter(
      (mealID) => sectionInfo.meals.findIndex((sectionMenuID) => sectionMenuID === mealID) === -1
    );

    // DELETE SECTION FROM MENU (FIREBASE)
    fsRemoveSectionMealsFromMenuSelectedMeals(menuID, updatedMenuMeals);
    fsDeleteSection(menuID, sectionID, sectionInfo.order);

    setTimeout(() => {
      // DELETE SECTION FROM MENU (REDUX)
      dispatch(rdxDeleteMenuSection({ menuID, sectionID, sectionMeals: sectionInfo.meals }));
      setLoading(false);
      onClose();
    }, 1000);
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={isOpen} onClose={onClose} scroll="paper">
      <DialogTitle>Remove Section</DialogTitle>

      <DialogContent sx={{ mb: 2 }}>
        <Typography variant="body1" color="error">
          {`Are you sure you want to remove "${sectionInfo.title}" section with all its meals ?`}
        </Typography>
      </DialogContent>

      <Divider />

      <DialogActions>
        <LoadingButton
          type="submit"
          variant="contained"
          color="error"
          onClick={deleteSectionHandler}
          loading={loading}
        >
          Remove Section
        </LoadingButton>
        <Button color="inherit" variant="outlined" onClick={onClose}>
          close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default RemoveSectionDialog;
