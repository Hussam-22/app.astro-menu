import { useState } from 'react';
import PropTypes from 'prop-types';

import { Box, Card, Stack, Tooltip, CardHeader, IconButton, Typography } from '@mui/material';

import Iconify from 'src/components/iconify';
import { LANGUAGE_CODES } from 'src/locales/languageCodes';
import DialogEditTitle from 'src/components/translation-cards/DialogEditTitle';
import TranslationCard from 'src/components/translation-cards/translation-card';

BusinessProfileTranslation.propTypes = {
  businessProfileInfo: PropTypes.object,
  isFetching: PropTypes.bool,
};

function BusinessProfileTranslation({ businessProfileInfo, isFetching = false }) {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const languageKeys = Object.keys(businessProfileInfo?.translationEdited || {});

  const closeModal = () => {
    setIsOpenModal(false);
  };

  return (
    <Stack spacing={3}>
      <Card>
        <CardHeader
          title={businessProfileInfo?.businessName}
          action={
            <Tooltip title="Edit">
              <IconButton color="info" size="small" onClick={() => setIsOpenModal(true)}>
                <Iconify icon="clarity:edit-line" width={24} height={24} />
              </IconButton>
            </Tooltip>
          }
        />
        <Box sx={{ p: 3, pt: 1 }}>
          <Typography variant="h6" />
          <Typography variant="body2">{businessProfileInfo?.description}</Typography>
        </Box>
      </Card>
      {languageKeys
        .sort((a, b) => LANGUAGE_CODES[a]?.name.localeCompare(LANGUAGE_CODES[b]?.name))
        .map((key) => (
          <TranslationCard
            languageKey={key}
            key={key}
            showTitleField={false}
            reduxSlice="branch"
            data={businessProfileInfo}
          />
        ))}

      {isOpenModal && (
        <DialogEditTitle
          isOpen={isOpenModal}
          onClose={closeModal}
          data={businessProfileInfo}
          showTitle={false}
        />
      )}
    </Stack>
  );
}

export default BusinessProfileTranslation;
