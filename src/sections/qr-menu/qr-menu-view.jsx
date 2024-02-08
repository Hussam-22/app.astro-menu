import { useQuery } from '@tanstack/react-query';

import { Stack, Divider, useTheme } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import MenuSection from 'src/sections/qr-menu/menu-section';

function QrMenuView() {
  const userID = 'n2LrTyRkktYlddyljHUPsodtpsf1';
  const branchID = 'b6VeXEYAvhXuXuvJzgN8';
  const menuID = 'eQte3b8zuSJ0w8RJ94bC';
  const tableID = 'CAosVcB66qxLOxqZtt3S';

  const theme = useTheme();
  const { fsGetUser, fsGetBranch, fsGetSections } = useAuthContext();

  const { data: userInfo = {}, isFetching: isUserFetching } = useQuery({
    queryKey: ['user', userID],
    queryFn: () => fsGetUser(userID),
  });

  const { data: branchInfo = {}, isFetching: isBranchFetching } = useQuery({
    queryKey: ['branch', userID, branchID],
    queryFn: () => fsGetBranch(branchID, userID),
    enabled: !isUserFetching,
  });

  const { data: sections = [], isFetching: isSectionsFetching } = useQuery({
    queryKey: ['sections', userID, menuID],
    queryFn: () => fsGetSections(menuID, userID),
    enabled: !isBranchFetching,
  });

  return (
    <Stack
      direction="column"
      spacing={2}
      divider={
        <Divider sx={{ border: 'dashed 1px', borderColor: theme.palette.divider }} flexItem />
      }
    >
      {sections
        .filter((section) => section.meals.length !== 0)
        .map((section) => (
          <MenuSection key={section.docID} sectionInfo={section} />
        ))}
    </Stack>
  );
}
export default QrMenuView;