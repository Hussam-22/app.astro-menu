import { Helmet } from 'react-helmet-async';

import MealManageView from 'src/sections/meal/view/meal-manage-view';

function MealManagePage() {
  return (
    <>
      <Helmet>
        <title> Meal | Manage</title>
      </Helmet>
      <MealManageView />
    </>
  );
}
export default MealManagePage;
