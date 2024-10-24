import * as Yup from 'yup';
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { render } from '@react-email/components';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Box, IconButton, InputAdornment, CircularProgress } from '@mui/material';

import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import { sendInvoiceEmail } from 'src/stripe/functions';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import CustomerOrderInvoiceEmail from 'src/emails/customer-order-invoice-email';

function SendEmailTextBox({ orderInfo, branchInfo, sx }) {
  const queryClient = useQueryClient();
  const {
    fsUpdateOrder,
    businessProfile: { businessName },
  } = useAuthContext();

  const schema = Yup.object().shape({
    customerEmail: Yup.string().email().required('Email is required'),
  });

  const defaultValues = useMemo(
    () => ({
      customerEmail: orderInfo?.customerEmail || '',
    }),
    [orderInfo?.customerEmail]
  );

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const { watch, handleSubmit, setValue } = methods;

  const values = watch();

  const { mutate, isPending } = useMutation({
    mutationFn: async (value) => {
      await fsUpdateOrder({
        orderID: orderInfo.docID,
        businessProfileID: orderInfo.businessProfileID,
        branchID: orderInfo.branchID,
        toUpdateFields: {
          customerEmail: value.customerEmail,
        },
      });

      const html = await render(
        <CustomerOrderInvoiceEmail
          orderInfo={orderInfo}
          branchInfo={branchInfo}
          businessName={businessName}
        />,
        {
          pretty: true,
        }
      );

      await sendInvoiceEmail(html, value.customerEmail, businessName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['order', orderInfo.docID, orderInfo.branchID]);
    },
  });

  const onSubmit = async (data) => {
    mutate(data);
  };

  return (
    <Box sx={{ ...sx }}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <RHFTextField
          name="customerEmail"
          label="Customer Email"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {isPending ? (
                  <CircularProgress size={20} />
                ) : (
                  <IconButton
                    color="primary"
                    type="submit"
                    disabled={values.customerEmail === ''}
                    sx={{ p: 0, m: 0 }}
                  >
                    <Iconify icon="streamline:send-email-solid" />
                  </IconButton>
                )}
              </InputAdornment>
            ),
          }}
        />
      </FormProvider>
    </Box>
  );
}
export default SendEmailTextBox;
SendEmailTextBox.propTypes = {
  orderInfo: PropTypes.object,
  branchInfo: PropTypes.object,
  sx: PropTypes.object,
};
