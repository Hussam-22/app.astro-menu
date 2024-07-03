import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';

import { Box, Card, useTheme, Container, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import Image from 'src/components/image';
import Label from 'src/components/label';
import { useRouter } from 'src/routes/hook';
import { useAuthContext } from 'src/auth/hooks';
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
  const theme = useTheme();
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
    <Card onClick={() => router.push(paths.dashboard.branches.manage(docID))}>
      <Box sx={{ position: 'relative', borderBottom: `dashed 1px ${theme.palette.divider}` }}>
        {branchCover()}
        <Label
          variant="filled"
          color={isActive ? 'success' : 'error'}
          sx={{ position: 'absolute', right: 10, bottom: 10 }}
        >
          {isActive ? 'Active' : 'Disabled'}
        </Label>
      </Box>
      <Typography variant="h6" sx={{ p: 1, textAlign: 'center' }}>
        {title}
      </Typography>
    </Card>
  );
}
