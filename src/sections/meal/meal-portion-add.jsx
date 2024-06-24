import { useFieldArray, useFormContext } from 'react-hook-form';

import { Box, Card, Stack, Button, IconButton, Typography, InputAdornment } from '@mui/material';

import Iconify from 'src/components/iconify';
import { RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function MealPortionAdd() {
  const {
    control,
    setValue,
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
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h4">Portions</Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={handleAdd}
        >
          Add new Portion
        </Button>
      </Stack>
      <Box sx={{ pt: 3 }}>
        <Stack spacing={2}>
          {fields.map((item, index) => (
            <Stack key={item.id} alignItems="center" spacing={1.5}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: 1 }}>
                <RHFTextField
                  size="small"
                  name={`portions[${index}].portionSize`}
                  label="Portion Size/Name"
                  InputLabelProps={{ shrink: true }}
                />

                <RHFTextField
                  size="small"
                  type="number"
                  name={`portions[${index}].price`}
                  label="Price"
                  onChange={(event) =>
                    setValue(`portions[${index}].price`, Number(event.target.value))
                  }
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  sx={{ maxWidth: { md: 125 } }}
                />

                <IconButton color="error" onClick={() => handleRemove(index)}>
                  <Iconify icon="mdi:cancel-circle" />
                </IconButton>
              </Stack>
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
