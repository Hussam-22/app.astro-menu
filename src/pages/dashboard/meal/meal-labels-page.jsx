import { Helmet } from 'react-helmet-async';

import MealLabelsView from 'src/sections/meal/view/meal-labels-view';

function MealLabelsPage() {
  return (
    <>
      <Helmet>
        <title>Meal | Labels</title>
      </Helmet>
      <MealLabelsView />
    </>
  );
}
export default MealLabelsPage;
