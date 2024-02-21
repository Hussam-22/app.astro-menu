import { useQuery } from '@tanstack/react-query';

import { Stack, Typography } from '@mui/material';

import { useParams } from 'src/routes/hook';
import { useAuthContext } from 'src/auth/hooks';
import MenuSection from 'src/sections/qr-menu/menu-section';

function QrMenuView() {
  const { userID, branchID, tableID } = useParams();
  const {
    fsGetUser,
    fsGetMealLabels,
    fsGetBranch,
    fsGetTableInfo,
    fsGetSections,
    fsOrderSnapshot,
    orderSnapShot,
  } = useAuthContext();

  const {
    data: tableInfo = {},
    isSuccess: isTableInfoSuccess,
    error: tableError,
  } = useQuery({
    queryKey: ['table', userID, branchID, tableID],
    queryFn: () => fsGetTableInfo(userID, branchID, tableID),
  });

  const { data: branchInfo = {} } = useQuery({
    queryKey: ['branch', userID, branchID],
    queryFn: () => fsGetBranch(branchID, userID),
    enabled: isTableInfoSuccess && tableInfo.isActive,
  });

  const { data: mealsLabel = [] } = useQuery({
    queryKey: ['mealsLabel', userID],
    queryFn: () => fsGetMealLabels(userID),
    enabled: isTableInfoSuccess && tableInfo.isActive,
  });

  const { data: sections = [] } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: tableInfo.menuID ? ['sections', userID, tableInfo.menuID] : null,
    queryFn: () => fsGetSections(tableInfo.menuID, userID),
    enabled: isTableInfoSuccess && tableInfo.isActive && tableInfo.menuID !== null,
  });

  const { data: orderInfo = {} } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: tableInfo.menuID ? ['order', userID, branchID, tableID, tableInfo.menuID] : null,
    queryFn: () => fsOrderSnapshot({ userID, branchID, tableID, menuID: tableInfo.menuID }),
    enabled: isTableInfoSuccess && tableInfo.isActive && tableInfo.menuID !== null,
  });

  if (!tableInfo?.isActive)
    return <Typography variant="h1">Sorry this table is not taking orders !!</Typography>;

  return (
    <Stack direction="column" spacing={5} sx={{ py: 5 }}>
      {sections
        .filter((section) => section.isActive)
        .sort((a, b) => a.order - b.order)
        .map((section) => (
          <MenuSection key={section.docID} sectionInfo={section} />
        ))}
    </Stack>
  );
}
export default QrMenuView;
