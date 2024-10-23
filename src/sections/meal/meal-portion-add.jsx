import { useFieldArray, useFormContext } from 'react-hook-form';

import { Box, Card, Stack, Button, Tooltip, Typography, IconButton } from '@mui/material';

import Iconify from 'src/components/iconify';
import { RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function MealPortionAdd() {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'portions',
  });

  const handleAdd = () => {
    append({
      portionSize: '',
      price: 0,
    });
  };

  const handleRemove = (index) => {
    remove(index);
  };

  return (
    <Card sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" sx={{ display: 'inline-block' }}>
            Portions
          </Typography>
          <Tooltip
            disableFocusListener
            title={
              <Typography>
                Set base prices for the meal, then flexibly adjust those prices for each menu,
                allowing the same meal to have different costs across different menus.
              </Typography>
            }
          >
            <Iconify icon="flat-color-icons:info" width={20} height={20} />
          </Tooltip>
        </Box>
        <Button
          variant="contained"
          color="inherit"
          size="small"
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={handleAdd}
        >
          Add new Portion
        </Button>
      </Stack>
      <Box sx={{ mt: 3 }}>
        <Stack spacing={2}>
          {fields.map((item, index) => (
            <Stack key={item.id} direction={{ xs: 'row', md: 'row' }} spacing={1}>
              <RHFTextField
                size="small"
                name={`portions[${index}].portionSize`}
                label="Portion Size/Name"
                InputLabelProps={{ shrink: true }}
                id={`portionSize-${index}`}
              />
              <RHFTextField
                size="small"
                type="number"
                name={`portions[${index}].price`}
                label="Price"
                sx={{ maxWidth: { xs: 75, sm: 125 } }}
              />

              <IconButton color="error" onClick={() => handleRemove(index)} sx={{ p: 0, m: 0 }}>
                <Iconify icon="mdi:cancel-circle" />
              </IconButton>
            </Stack>
          ))}
          {errors?.portions?.message && (
            <Typography variant="caption" color="error" sx={{ pl: 1 }}>
              {errors.portions.message}
            </Typography>
          )}
        </Stack>
      </Box>
    </Card>
  );
}
