import { useState } from 'react';
import { useParams } from 'react-router';
import { useSelector } from 'react-redux';

import Grid from '@mui/material/Unstable_Grid2';
import { Box, Card, Stack, Button, Typography } from '@mui/material';

import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import { LANGUAGE_CODES } from 'src/locales/languageCodes';
import LanguageCard from 'src/components/translation-cards/LanguageCard';
import DialogEditTitle from 'src/components/translation-cards/DialogEditTitle';

function BranchTranslation() {
  const { id: branchID } = useParams();
  const { fsDocSnapshot, docSnapshot } = useAuthContext();

  const { branch } = useSelector((state) => state.branch);
  const languageKeys = Object.keys(docSnapshot.translationEdited || {});
  const [isOpenModal, setIsOpenModal] = useState(false);

  const closeModal = () => {
    setIsOpenModal(false);
  };

  // useEffect(() => {
  //   (async () => {
  //     await fsDocSnapshot('branch', branchID);
  //   })();
  // }, [branchID, fsDocSnapshot]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={12}>
        {/* {isLoading && <Skeleton variant="rounded" height={210} sx={{ borderRadius: 2 }} />} */}

        <Card sx={{ p: 3 }}>
          <Stack spacing={2} direction="column">
            <Typography variant="h5">English (Original)</Typography>
            <Typography variant="body2">{branch.description}</Typography>
            <Box sx={{ textAlign: 'right' }}>
              <Button
                variant="contained"
                color="info"
                onClick={() => setIsOpenModal(true)}
                startIcon={<Iconify icon="clarity:edit-line" width={18} height={18} />}
              >
                Edit
              </Button>
            </Box>
          </Stack>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Stack spacing={3}>
          {languageKeys
            .sort((a, b) => LANGUAGE_CODES[a].localeCompare(LANGUAGE_CODES[b]))
            .map((key) => (
              <LanguageCard
                languageKey={key}
                key={key}
                showTitleField={false}
                reduxSlice="branch"
              />
            ))}
        </Stack>
      </Grid>

      {isOpenModal && (
        <DialogEditTitle
          isOpen={isOpenModal}
          onClose={closeModal}
          data={branch}
          showTitle={false}
        />
      )}
    </Grid>
  );
}

export default BranchTranslation;
