import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';

import { Box, Card, Stack, Button, Container, Typography } from '@mui/material';

import Image from 'src/components/image';
import Label from 'src/components/label';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import TextMaxLine from 'src/components/text-max-line';
import { useSettingsContext } from 'src/components/settings';

function BranchesListView() {
  const { themeStretch } = useSettingsContext();
  const { fsGetAllBranches } = useAuthContext();

  const {
    data: branchesInfo = [],
    isFetching,
    failureCount,
  } = useQuery({
    queryKey: ['branches'],
    queryFn: () => fsGetAllBranches(),
  });
  return (
    <Container maxWidth={themeStretch ? false : 'lg'}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3,1fr)',
          gap: 2,
        }}
      >
        {branchesInfo.map((branch) => (
          <BranchCard key={branch.docID} branchInfo={branch} />
        ))}
      </Box>
    </Container>
  );
}
export default BranchesListView;

// ----------------------------------------------------------------------------

BranchCard.propTypes = {
  branchInfo: PropTypes.object,
};

function BranchCard({ branchInfo }) {
  const router = useRouter();
  const { title, cover, docID, description, isActive } = branchInfo;

  const branchCover = () => {
    if (cover === undefined)
      return (
        <Image disabledEffect alt={title} src="/assets/mock-images/branch-mock.webp" ratio="4/3" />
      );
    return <Image disabledEffect alt={title} src={cover} ratio="4/3" />;
  };

  // <CircularProgress sx={{ borderRadius: 1.5, width: 48, height: 48, mr: 2 }} />

  return (
    <Card>
      {branchCover()}
      <Stack direction="column" spacing={0.5} sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{title}</Typography>
          <Label color={isActive ? 'success' : 'error'}>{isActive ? 'Active' : 'Disabled'}</Label>
        </Stack>
        <TextMaxLine variant="body2">
          {description || `No Description Available for this branch`}
        </TextMaxLine>
        <Button
          variant="text"
          color="primary"
          sx={{ alignSelf: 'flex-start', ml: -1 }}
          onClick={() => router.push(paths.dashboard.branches.manage(docID))}
          startIcon={<Iconify icon="ph:gear-thin" />}
        >
          Manage Branch
        </Button>
      </Stack>
    </Card>
  );
}
