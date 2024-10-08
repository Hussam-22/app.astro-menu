import * as Yup from 'yup';
import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import { Card, Stack, MenuItem } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';
import OrderDetailsDrawer from 'src/sections/orders/drawers/order-details-drawer';

function SearchSingleOrder() {
  const { enqueueSnackbar } = useSnackbar();
  const { fsGetOrderByID, fsGetAllBranches } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const [orderInfo, setOrderInfo] = useState({});
  const queryClient = useQueryClient();

  const { data: branchesData, isLoading: branchIsLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: fsGetAllBranches,
  });

  const NewMealSchema = Yup.object().shape({
    orderID: Yup.string().required('Order ID is required'),
    branchID: Yup.string().required('Select Branch'),
  });

  const defaultValues = {
    orderID: '',
    branchID: '',
  };

  const methods = useForm({
    resolver: yupResolver(NewMealSchema),
    defaultValues,
  });

  const { handleSubmit, watch } = methods;

  const values = watch();

  const { isPending, mutate, data, error } = useMutation({
    mutationKey: ['order', values.orderID],
    mutationFn: ({ orderID, branchID }) => fsGetOrderByID(orderID, branchID),
    onSuccess: (orderData) => {
      if (orderData) {
        setOrderInfo(orderData);
        setIsOpen(true);
        queryClient.setQueryData(['order', orderData.docID], orderData);
      } else {
        enqueueSnackbar('Order not found', { variant: 'error' });
      }
    },
  });

  const onSubmit = async (formData) => {
    mutate({ orderID: formData.orderID, branchID: formData.branchID });
  };
  return (
    <Card sx={{ p: 1 }}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack direction="row" spacing={2} sx={{ py: 2 }}>
          <RHFSelect name="branchID" label="Branch" sx={{ width: '30%' }}>
            <MenuItem value={0}>Select Branch</MenuItem>
            {branchesData?.map((branch) => (
              <MenuItem key={branch.docID} value={branch.docID}>
                {branch.title}
              </MenuItem>
            ))}
          </RHFSelect>

          <RHFTextField name="orderID" label="Order ID (Case Sensitive)" />
          <LoadingButton
            variant="soft"
            color="primary"
            size="large"
            type="submit"
            loading={isPending}
            sx={{ width: '20%' }}
          >
            Search
          </LoadingButton>
        </Stack>
      </FormProvider>

      <OrderDetailsDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} orderInfo={orderInfo} />
    </Card>
  );
}
export default SearchSingleOrder;
