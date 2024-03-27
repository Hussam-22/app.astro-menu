import { Stack, Typography } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import MenuSection from 'src/sections/qr-menu/menu-section';
import { useQrMenuContext } from 'src/sections/qr-menu/context/qr-menu-context';

function QrMenuView() {
  const { menuSections } = useAuthContext();
  const { tableInfo } = useQrMenuContext();

  if (tableInfo?.docID && !tableInfo?.isActive)
    return <Typography variant="h1">Sorry this table is not taking orders !!</Typography>;

  return (
    <Stack direction="column" spacing={3} sx={{ py: 5 }}>
      {menuSections
        .filter((section) => section.isActive)
        .sort((a, b) => a.order - b.order)
        .map((section) => (
          <MenuSection key={section.docID} sectionInfo={section} />
        ))}
    </Stack>
  );
}
export default QrMenuView;
