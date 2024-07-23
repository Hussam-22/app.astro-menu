import { useState } from 'react';
import PropTypes from 'prop-types';

import {
  Box,
  Stack,
  Button,
  Dialog,
  Divider,
  Skeleton,
  Typography,
  DialogTitle,
} from '@mui/material';

import { LANGUAGE_CODES } from 'src/locales/languageCodes';

import TranslationTextField from '../TranslationTextField';
// ----------------------------------------------------------------------

TranslationDialog.propTypes = {
  sectionID: PropTypes.string,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  languagesLength: PropTypes.number,
};

function TranslationDialog({ sectionID, isOpen, onClose, languagesLength }) {
  const [formIsSubmitting, setFormIsSubmitting] = useState(false);
  // const sectionInfo = useSelector((state) =>
  //   state.menu.menu.sections.find((section) => section.id === sectionID)
  // );

  const sectionInfo = {};

  const formStateHandler = (state) => {
    setFormIsSubmitting(state);
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={isOpen} onClose={onClose} scroll="paper">
      <DialogTitle sx={{ mb: 2 }}>
        <Stack direction="column">
          Section Translation
          <Typography variant="body2" color="inherit">
            {sectionInfo?.title}
          </Typography>
        </Stack>
      </DialogTitle>

      <Box sx={{ p: 2 }}>
        <Stack direction="column" spacing={2}>
          {sectionInfo?.translation !== undefined &&
            !formIsSubmitting &&
            Object.keys(sectionInfo.translation)
              .sort((a, b) => LANGUAGE_CODES[a].name.localeCompare(LANGUAGE_CODES[b].name))
              .map((langKey) => (
                <TranslationTextField
                  key={langKey}
                  languageKey={langKey}
                  sectionInfo={sectionInfo}
                  isLoading={formStateHandler}
                />
              ))}
          {(sectionInfo?.translation === undefined || formIsSubmitting) &&
            [...Array(languagesLength)].map((item, index) => (
              <Skeleton variant="text" height={60} key={index} />
            ))}
        </Stack>
        <Divider sx={{ py: 1, px: 1 }} />
        <Stack direction="row" justifyContent="right">
          <Button color="inherit" variant="outlined" onClick={onClose} sx={{ mt: 2 }}>
            close
          </Button>
        </Stack>
      </Box>
    </Dialog>
  );
}

export default TranslationDialog;
