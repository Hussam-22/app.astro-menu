import PropTypes from 'prop-types';

import {
  Stack,
  Dialog,
  Button,
  Divider,
  Typography,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import Image from 'src/components/image';

function BuildingProfileDialog({ open, onClose }) {
  const onDialogClose = () => {
    onClose();
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onDialogClose}>
      {/* <DialogTitle>Creating Astro-Menu Account...</DialogTitle> */}
      <Stack
        direction="column"
        alignItems="center"
        justifyContent="center"
        spacing={2}
        sx={{ p: 3 }}
      >
        <Image src="/assets/icons/auth/success.svg" sx={{ height: 55, width: 55 }} />
        <Typography sx={{ fontWeight: 600 }}>
          Account Successfully Created, Check your email for verification before logging in.
        </Typography>
      </Stack>

      <Divider sx={{ borderStyle: 'dashed' }} />
      <DialogActions>
        <Button variant="soft" onClick={onDialogClose} color="secondary">
          Close
        </Button>
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
