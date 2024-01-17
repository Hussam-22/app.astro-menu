import PropTypes from 'prop-types';
import { useRef, useState } from 'react';
import { useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';

import { LoadingButton } from '@mui/lab';
import {
  Dialog,
  Button,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
} from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import { rdxStopLoading, rdxStartLoading } from 'src/redux/slices/branch';

AddTablesDialog.propTypes = {
  onClose: PropTypes.func,
  isOpen: PropTypes.bool,
  onNewTableAdd: PropTypes.func,
};

function AddTablesDialog({ isOpen, onClose, onNewTableAdd }) {
  const countRef = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const { fsAddBatchTablesToBranch } = useAuthContext();
  const { id: branchID } = useParams();
  const dispatch = useDispatch();
  const { tables } = useSelector((state) => state.branch);

  const onAddTablesHandler = () => {
    setIsLoading(true);

    dispatch(rdxStartLoading());
    fsAddBatchTablesToBranch(countRef.current.value, branchID, tables.length);

    setTimeout(() => {
      setIsLoading(false);
      dispatch(rdxStopLoading());
      onNewTableAdd();
      onClose();
    }, 2000);
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={isOpen} onClose={onClose}>
      <DialogTitle>Add multiple tables to branch</DialogTitle>
      <DialogContent sx={{ mt: 3 }}>
        <TextField
          fullWidth
          variant="filled"
          label="How many tables? (Number only)"
          type="number"
          inputRef={countRef}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <LoadingButton
                  onClick={onAddTablesHandler}
                  variant="text"
                  loading={isLoading}
                  fullWidth
                >
                  Add Tables
                </LoadingButton>
              </InputAdornment>
            ),
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddTablesDialog;
