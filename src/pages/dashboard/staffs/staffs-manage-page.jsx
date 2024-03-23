import { Helmet } from 'react-helmet-async';

import StaffsManageView from 'src/sections/staffs/view/staffs-manage.-view';

function BranchListPage() {
  return (
    <>
      <Helmet>
        <title> Staffs: Manage</title>
      </Helmet>
      <StaffsManageView />
    </>
  );
}
export default BranchListPage;
