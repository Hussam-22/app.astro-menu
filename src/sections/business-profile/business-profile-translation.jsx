import { useState } from 'react';

import { Box, Card, Stack, Tooltip, CardHeader, IconButton, Typography } from '@mui/material';

import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import { LANGUAGE_CODES } from 'src/locales/languageCodes';
import DialogEditTitle from 'src/components/translation-cards/DialogEditTitle';
import TranslationCard from 'src/components/translation-cards/translation-card';

// BusinessProfileTranslation.propTypes = {
//   businessProfile: PropTypes.object,
//   isFetching: PropTypes.bool,
// };

function BusinessProfileTranslation() {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const { businessProfile } = useAuthContext();
  const languageKeys = Object.keys(businessProfile?.translationEdited || {});

  console.log(businessProfile);

  const closeModal = () => {
    setIsOpenModal(false);
  };

  return (
    <Stack spacing={3}>
      <Card>
        <CardHeader
          title={businessProfile.businessName}
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
          <Typography variant="body2">{businessProfile.description}</Typography>
        </Box>
      </Card>
      {languageKeys
        .sort((a, b) => LANGUAGE_CODES[a].name.localeCompare(LANGUAGE_CODES[b].name))
        .map((key) => (
          <TranslationCard
            languageKey={key}
            key={key}
            showTitleField
            reduxSlice="branch"
            data={businessProfile}
          />
        ))}

      {isOpenModal && (
        <DialogEditTitle
          isOpen={isOpenModal}
          onClose={closeModal}
          data={businessProfile}
          showTitle={false}
        />
      )}
    </Stack>
  );
}

export default BusinessProfileTranslation;
