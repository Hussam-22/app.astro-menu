import { Helmet } from 'react-helmet-async';

import MealLabelsView from 'src/sections/meal-labels/meal-labels-view';

function BusinessProfileManagePage() {
  return (
    <>
      <Helmet>
        <title>Meal Labels</title>
      </Helmet>
      <MealLabelsView />
    </>
  );
}
export default BusinessProfileManagePage;
