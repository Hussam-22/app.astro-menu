import { useState } from 'react';
import PropTypes from 'prop-types';

import { Box, Card, Stack, Tooltip, CardHeader, IconButton, Typography } from '@mui/material';

import Iconify from 'src/components/iconify';
import { LANGUAGE_CODES } from 'src/locales/languageCodes';
import LanguageCard from 'src/components/translation-cards/LanguageCard';
import DialogEditTitle from 'src/components/translation-cards/DialogEditTitle';
import TranslationCardSkeleton from 'src/components/translation-cards/translation-skeleton';

BranchTranslation.propTypes = { branchInfo: PropTypes.object, isFetching: PropTypes.bool };

function BranchTranslation({ branchInfo, isFetching }) {
  const languageKeys = Object.keys(branchInfo?.translationEdited || {});
  const [isOpenModal, setIsOpenModal] = useState(false);

  const closeModal = () => {
    setIsOpenModal(false);
  };

  if (isFetching) return <TranslationCardSkeleton languageKeys={languageKeys} />;

  return (
    <Stack spacing={3}>
      <Card>
        <CardHeader
          title="Branch About Text"
          sx={{ color: 'info.main' }}
          action={
            <Tooltip title="Edit">
              <IconButton color="info" size="small" onClick={() => setIsOpenModal(true)}>
                <Iconify icon="clarity:edit-line" width={24} height={24} />
              </IconButton>
            </Tooltip>
          }
        />
        <Box sx={{ p: 3, pt: 1 }}>
          <Typography>{branchInfo.description}</Typography>
        </Box>
      </Card>
      {!isFetching &&
        languageKeys
          .sort((a, b) => LANGUAGE_CODES[a].name.localeCompare(LANGUAGE_CODES[b].name))
          .map((key) => (
            <LanguageCard
              languageKey={key}
              key={key}
              showTitleField={false}
              reduxSlice="branch"
              data={branchInfo}
            />
          ))}

      {isOpenModal && (
        <DialogEditTitle
          isOpen={isOpenModal}
          onClose={closeModal}
          data={branchInfo}
          showTitle={false}
        />
      )}
    </Stack>
  );
}

export default BranchTranslation;
