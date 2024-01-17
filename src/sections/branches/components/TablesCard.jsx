import { useState } from 'react';
import PropTypes from 'prop-types';

import { Box, Grid, Card, Button, Avatar, Divider } from '@mui/material';

import Iconify from 'src/components/iconify';
import DownloadAllQRs from 'src/sections/branches/components/DownloadAllQRs';

import AddTablesDialog from './dialogs/AddTablesDialog';
import ChangeDefaultMenu from './dialogs/ChangeDefaultMenu';

TablesCard.propTypes = {
  tables: PropTypes.array,
  theme: PropTypes.object,
  onTableClick: PropTypes.func,
  onNewTableAdd: PropTypes.func,
};

function TablesCard({ tables, theme, onTableClick, onNewTableAdd }) {
  const [openDialog, setOpenDialog] = useState({
    newTable: false,
    changeDefaultMenu: false,
  });
  const onDialogClose = (dialog) => setOpenDialog((state) => ({ ...state, [dialog]: false }));
  const openDialogHandler = (dialog) => setOpenDialog((state) => ({ ...state, [dialog]: true }));

  const downloadAllTableQRImages = () => {
    tables.map((table) => {
      const canvas = document.getElementById(table.id);
      const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `${table.index}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      return null;
    });
  };

  return (
    <Grid item xs={12}>
      <Box sx={{ display: 'flex', gap: 3, flexDirection: 'column' }}>
        <Card sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="text"
              startIcon={<Iconify icon="mdi:file-replace-outline" />}
              onClick={() => openDialogHandler('changeDefaultMenu')}
            >
              Change Menu for All Tables
            </Button>
            <Button
              variant="text"
              startIcon={<Iconify icon="uil:image-download" />}
              onClick={downloadAllTableQRImages}
            >
              Download All Tables QR Images
            </Button>
            <Button
              variant="text"
              startIcon={<Iconify icon="eva:plus-fill" />}
              onClick={() => openDialogHandler('newTable')}
            >
              New Table(s)
            </Button>
          </Box>

          <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              flexWrap: 'wrap',
              gap: '10px 20px',
              pt: 2,
            }}
          >
            {[...tables]
              .sort((a, b) => a.index - b.index)
              .map((table) => (
                <Avatar
                  key={table.id}
                  variant="circular"
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: table.isActive ? theme.palette.success.main : theme.palette.error.main,
                    border: 'dashed 1px #000000',
                  }}
                >
                  <Button onClick={() => onTableClick(table)} sx={{ color: '#FFFFFF' }}>
                    {table.index}
                  </Button>
                </Avatar>
              ))}
          </Box>
          {openDialog.newTable && (
            <AddTablesDialog
              isOpen={openDialog.newTable}
              onClose={() => onDialogClose('newTable')}
              onNewTableAdd={onNewTableAdd}
            />
          )}
          {openDialog.changeDefaultMenu && (
            <ChangeDefaultMenu
              isOpen={openDialog.changeDefaultMenu}
              onClose={() => onDialogClose('changeDefaultMenu')}
            />
          )}
          <DownloadAllQRs tables={tables} />
        </Card>
      </Box>
    </Grid>
  );
}

export default TablesCard;
