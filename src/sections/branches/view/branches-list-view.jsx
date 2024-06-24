import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';

import { Box, Card, Stack, Button, Container, Typography } from '@mui/material';

import Image from 'src/components/image';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
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
  const { title, cover, docID, description } = branchInfo;

  const branchCover = () => {
    if (cover === undefined)
      return <Image disabledEffect alt={title} src="/assets/mock-images/branch-cover.png" />;
    return <Image disabledEffect alt={title} src={cover} ratio="4/3" />;
  };

  // <CircularProgress sx={{ borderRadius: 1.5, width: 48, height: 48, mr: 2 }} />

  return (
    <Card>
      {branchCover()}
      <Stack direction="column" spacing={1} sx={{ p: 2 }}>
        <Typography variant="h6">{title}</Typography>
        <TextMaxLine variant="body2">{description}</TextMaxLine>
        <Button
          variant="contained"
          color="primary"
          sx={{ alignSelf: 'flex-end' }}
          onClick={() => router.push(paths.dashboard.branches.manage(docID))}
        >
          Manage Branch
        </Button>
      </Stack>
    </Card>
  );
}
