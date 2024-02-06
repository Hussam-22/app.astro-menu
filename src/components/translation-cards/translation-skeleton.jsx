import PropTypes from 'prop-types';

import { Card, Grid, Stack, Skeleton } from '@mui/material';

function TranslationCardSkeleton({ languageKeys }) {
  return (
    <Grid container spacing={5}>
      {[...Array(languageKeys.length + 1)].map((_, index) => (
        <Grid item xs={12} md={12} key={index}>
          <Card sx={{ p: 3 }}>
            <Stack direction="column" spacing={3}>
              <Skeleton variant="rounded" />
              <Skeleton variant="rounded" />
            </Stack>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
export default TranslationCardSkeleton;

TranslationCardSkeleton.propTypes = { languageKeys: PropTypes.array };
