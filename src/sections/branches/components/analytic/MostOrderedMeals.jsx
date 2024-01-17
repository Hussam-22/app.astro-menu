import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';

import { useChart } from 'src/components/chart';
// import { AnalyticsConversionRates } from 'src/sections/@dashboard/general/analytics';

// ----------------------------------------------------------------------

MostOrderedMeals.propTypes = {
  branch: PropTypes.object,
  userData: PropTypes.object,
  month: PropTypes.number,
  year: PropTypes.number,
};

export default function MostOrderedMeals({ userData, branch, month, year }) {
  const { meals } = useSelector((state) => state.meal);
  const [mealsStatisticsData, setMealsStatisticsData] = useState({});
  const [mealsIDs, setMealsIDs] = useState([]);
  const [nonZeroMeals, setNonZeroMeals] = useState([]);

  const monthLong = new Date(`${month + 1}/01/${year}`).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  useEffect(() => {
    setMealsStatisticsData(
      userData?.statisticsSummary?.branches[branch.id]?.meals?.[year]?.[month]
    );
  }, [branch.id, month, userData, year]);

  useEffect(() => {
    if (
      typeof mealsStatisticsData !== 'undefined' &&
      Object.keys(mealsStatisticsData).length !== 0
    ) {
      setMealsIDs(Object.keys(mealsStatisticsData));
    } else setMealsIDs([]);
  }, [mealsStatisticsData, month, userData, year]);

  useEffect(() => {
    if (mealsIDs.length !== 0) {
      setNonZeroMeals(() => meals.filter((meal) => mealsIDs.includes(meal.id)));
    } else setNonZeroMeals([]);
  }, [meals, mealsIDs]);

  const data = nonZeroMeals
    .map((meal) => ({ label: meal.title, value: mealsStatisticsData?.[meal.id] || 0 }))
    .sort((a, b) => b.value - a.value);

  return (
    // <AnalyticsConversionRates
    //   title="Most Ordered Meals"
    //   subheader={`The chart represents orders for the current month : ${monthLong}`}
    //   chart={{
    //     series: data,
    //   }}
    // />
    null
  );
}

// -------------------------------------------------------------------

ScanUsageOverTheYear.propTypes = {
  incomeData: PropTypes.array,
  year: PropTypes.number,
};

function ScanUsageOverTheYear({ incomeData, year }) {
  const initialArrayOfZeroes = Array(12).fill(0);
  const income = initialArrayOfZeroes.map((_, index) => incomeData?.[year]?.[index] || 1);

  const chartLabels = incomeData.map((meal) => meal.title);
  const chartOptions = useChart({
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: chartLabels,
    },
    tooltip: {
      y: {
        formatter: (val) => `${val}`,
      },
    },
  });

  return (
    <ReactApexChart type="bar" series={[{ data: income }]} options={chartOptions} height={200} />
  );
}
