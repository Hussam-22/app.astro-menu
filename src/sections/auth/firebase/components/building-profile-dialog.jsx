import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import {
  Stack,
  Button,
  Dialog,
  Divider,
  Typography,
  DialogActions,
  DialogContent,
  CircularProgress,
  Unstable_Grid2 as Grid,
} from '@mui/material';

import Image from 'src/components/image';

function BuildingProfileDialog({ open, onClose }) {
  const [step, setStep] = useState(1);

  const onDialogClose = () => {
    if (step === 7) onClose();
  };

  useEffect(() => {
    if (step === 7 || !open) return;
    setTimeout(() => {
      setStep((state) => state + 1);
    }, 500);
  }, [open, step]);

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={onDialogClose}>
      {/* <DialogTitle>Creating Astro-Menu Account...</DialogTitle> */}
      <Grid container spacing={2} sx={{ m: 1 }}>
        <Grid xs={12} sm={7}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            Creating Astro-Menu Account...
          </Typography>
          <StepItem index={1} step={step} text="Step 1: Create business Profile" />
          <StepItem index={2} step={step} text="Step 2: Create a branch" />
          <StepItem index={3} step={step} text="Step 3: Create QR codes for tables" />
          <StepItem index={4} step={step} text="Step 4: Create a menu" />
          <StepItem
            index={5}
            step={step}
            text="Step 5: Create some meals and add them to the menu"
          />
          <StepItem index={6} step={step} text="Step 6: Sending Verification Email" />
        </Grid>
        <Grid
          xs={12}
          sm={5}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            textAlign: 'center',
            gap: 1,
            bgcolor: 'grey.100',
            borderRadius: 1,
            opacity: step === 7 ? 1 : 0,
            transition: 'opacity 0.5s ease-in',
          }}
        >
          <Image src="/assets/icons/auth/success.svg" sx={{ height: 80 }} />
          <Typography sx={{ fontWeight: 600 }}>
            Account Successfully Created, Check your email for verification
          </Typography>
        </Grid>
      </Grid>
      <Divider sx={{ borderStyle: 'dashed' }} />
      <DialogActions>
        <Stack direction="row" alignItems="center" spacing={2}>
          {step === 7 && (
            <Button variant="contained" onClick={onDialogClose} color="success">
              Close
            </Button>
          )}
        </Stack>
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
    <DialogContent sx={{ pl: 0, ml: 0 }}>
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
