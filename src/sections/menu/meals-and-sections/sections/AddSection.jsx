import * as Yup from 'yup';
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import { Card, InputAdornment } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

AddSection.propTypes = { sections: PropTypes.array };

function AddSection({ sections }) {
  const dispatch = useDispatch();
  const { id: menuID } = useParams();
  const { fsAddSection } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const menuSections = useSelector((state) => state.menu.menu.sections);
  const queryClient = useQueryClient();

  const NewUserSchema = Yup.object().shape({
    sectionName: Yup.string()
      .required('Section Name Cant be Empty !!')
      .notOneOf(sections.map((section) => section.title)),
  });

  const defaultValues = useMemo(() => ({ sectionName: '' }), []);

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const { isPending, mutate } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
    onSuccess: () => {
      const queryKeys = [`sections-${menuID}`];
      queryClient.invalidateQueries(queryKeys);
      enqueueSnackbar('Section Add Successfully !!');
      reset();
    },
  });

  const addSectionHandler = async (data) => {
    mutate(() => fsAddSection(menuID, data.sectionName.trim(), sections.length + 1));
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(addSectionHandler)}>
      <Card sx={{ p: 3 }}>
        <RHFTextField
          name="sectionName"
          label="Section Name"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <LoadingButton type="submit" variant="text" loading={isPending} fullWidth>
                  Add Section
                </LoadingButton>
              </InputAdornment>
            ),
          }}
        />
      </Card>
    </FormProvider>
  );
}

export default AddSection;
