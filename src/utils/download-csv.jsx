import React from 'react';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';

const DownloadCSV = () => {
  const { fsGetCustomers, fsGetAllBranches } = useAuthContext();

  const { data: customersList = [], error } = useQuery({
    queryKey: ['customers'],
    queryFn: fsGetCustomers,
  });

  const { data: branchesData, isLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: fsGetAllBranches,
    enabled: customersList.length > 0,
  });

  if (!customersList || customersList?.length === 0 || !branchesData || branchesData?.length === 0)
    return null;

  const mutateDataFn = (data) => {
    const mutatedData = data.map((customer) => ({
      email: customer.email,
      'last visit time': `"${new Date(customer.lastOrder.seconds * 1000).toLocaleString()}"`,
      'total visits': customer.totalVisits,
      'last visited branch': branchesData.find(
        (branch) => branch.docID === customer.lastVisitBranchID
      )?.title,
    }));
    return mutatedData;
  };

  const mutateData = mutateDataFn(customersList);

  console.log(mutateData);

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

  const downloadCSV = () => {
    if (!mutateData.length) return;

    const csvData = new Blob([convertToCSV(mutateData)], { type: 'text/csv' });
    const csvURL = URL.createObjectURL(csvData);
    const link = document.createElement('a');
    link.href = csvURL;
    link.download = `customers-list.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button variant="contained" onClick={downloadCSV}>
      Download CSV
    </Button>
  );
};

export default DownloadCSV;

// DownloadCSV.propTypes = {
//   data: PropTypes.array.isRequired,
//   fileName: PropTypes.string.isRequired,
// };
