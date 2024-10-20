import { useSnackbar } from 'notistack';
import { useQuery } from '@tanstack/react-query';
import React, { useState, useEffect } from 'react';

import { LoadingButton } from '@mui/lab';

import SvgColor from 'src/components/svg-color';
import { useAuthContext } from 'src/auth/hooks';

const DownloadCSV = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { fsGetCustomers, fsGetAllBranches } = useAuthContext();
  const [allowDownload, setAllowDownload] = useState(false);

  const {
    data: customersList = [],
    error,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['customers'],
    queryFn: fsGetCustomers,
    enabled: allowDownload,
  });

  const { data: branchesData } = useQuery({
    queryKey: ['branches'],
    queryFn: fsGetAllBranches,
    enabled: customersList.length > 0,
  });

  useEffect(() => {
    if (isError) {
      enqueueSnackbar('Error in fetching customers', { variant: 'error' });
      setAllowDownload(false);
    }

    if (allowDownload) {
      // const mutateData = mutateDataFn(customersList);

      const mutatedData = customersList.map((customer) => ({
        email: customer.email,
        'last visit time': `"${new Date(customer.lastOrder.seconds * 1000).toLocaleString()}"`,
        'total visits': customer.totalVisits,
        'last visited branch': branchesData.find(
          (branch) => branch.docID === customer.lastVisitBranchID
        )?.title,
      }));

      if (mutatedData.length === 0) return;

      const csvData = new Blob([convertToCSV(mutatedData)], { type: 'text/csv' });
      const csvURL = URL.createObjectURL(csvData);
      const link = document.createElement('a');
      link.href = csvURL;
      link.download = `customers-list.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setAllowDownload(false);
    }
  }, [allowDownload, branchesData, customersList, enqueueSnackbar, isError]);

  if (!branchesData || branchesData?.length === 0) return null;

  // ----------------------------------------------------------------------------
  const convertToCSV = (objArray) => {
    if (!objArray.length) return '';

    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = '';

    // Add headers
    const headers = Object.keys(array[0]).join(',');
    str += `${headers}\r\n`;

    // Add rows
    array.forEach((item) => {
      const line = Object.values(item).join(',');
      str += `${line}\r\n`;
    });

    return str;
  };
  // ----------------------------------------------------------------------------

  const downloadCSV = async () => {
    setAllowDownload(true);
  };

  return (
    <LoadingButton
      loading={isLoading}
      variant="contained"
      onClick={downloadCSV}
      startIcon={<SvgColor src="/assets/icons/navbar/ic_csv.svg" />}
    >
      Export All Emails
    </LoadingButton>
  );
};

export default DownloadCSV;

// DownloadCSV.propTypes = {
//   data: PropTypes.array.isRequired,
//   fileName: PropTypes.string.isRequired,
// };
