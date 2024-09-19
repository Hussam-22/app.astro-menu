import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import {
  Stack,
  Button,
  Dialog,
  Divider,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
  CircularProgress,
} from '@mui/material';

import Image from 'src/components/image';

function BuildingProfileDialog({ open, onClose }) {
  const [step, setStep] = useState(1);

  const onDialogClose = () => {
    if (step === 7) onClose();
  };

  useEffect(() => {
    if (step === 7) return;
    setTimeout(() => {
      setStep((state) => state + 1);
    }, 1000);
  }, [step]);

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={onDialogClose}>
      <DialogTitle>Creating Astro-Menu Account...</DialogTitle>
      <StepItem index={1} step={step} text="Step 1: Create business Profile" />
      <StepItem index={2} step={step} text="Step 2: Create a branch" />
      <StepItem index={3} step={step} text="Step 3: Create QR codes for tables" />
      <StepItem index={4} step={step} text="Step 4: Create a menu" />
      <StepItem index={5} step={step} text="Step 5: Create some meals and add them to the menu" />
      <StepItem index={6} step={step} text="Step 6: Sending Verification Email" />
      <Divider sx={{ py: 1, borderStyle: 'dashed' }} />
      <DialogActions>
        {step === 7 && (
          <Button variant="contained" onClick={onDialogClose} color="success">
            CLose
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
export default BuildingProfileDialog;

BuildingProfileDialog.propTypes = { open: PropTypes.bool, onClose: PropTypes.func };

// ----------------------------------------------------------------------------

StepItem.propTypes = { index: PropTypes.number, step: PropTypes.number, text: PropTypes.string };

function StepItem({ index, step, text }) {
  return (
    <DialogContent>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography sx={{ color: step < index ? 'text.disabled' : 'secondary' }}>{text}</Typography>
        {step === index && <CircularProgress thickness={3} size={15} />}
        {step > index && (
          <Image src="/assets/icons/auth/check-circle-pink.svg" sx={{ height: 21 }} />
        )}
      </Stack>
    </DialogContent>
  );
}
