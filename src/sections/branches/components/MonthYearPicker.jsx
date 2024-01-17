import PropTypes from 'prop-types';

import { Stack, Select, MenuItem } from '@mui/material';

MonthYearPicker.propTypes = {
  month: PropTypes.number,
  year: PropTypes.number,
  updateMonth: PropTypes.func,
  updateYear: PropTypes.func,
  availableYears: PropTypes.array,
};

function MonthYearPicker({ month, year, updateMonth, updateYear, availableYears }) {
  // const availableYears = [...new Set(usageData.map((table) => Object.keys(table?.scans || year)).flat())];

  return (
    <Stack direction="row" spacing={1}>
      <Select
        value={
          year === new Date().getFullYear() && month > new Date().getMonth()
            ? new Date().getMonth()
            : month
        }
        onChange={(e) => updateMonth(e.target.value)}
        label="Month"
        size="small"
      >
        {[...new Array(13)]
          .filter(
            (_, monthIndex) =>
              (year !== new Date().getFullYear() && monthIndex) ||
              (year === new Date().getFullYear() && monthIndex <= new Date().getMonth())
          )
          .map((_, monthIndex) => (
            <MenuItem key={monthIndex} value={monthIndex}>
              {new Date(`${monthIndex + 1}/01/2022`).toLocaleDateString('en-US', { month: 'long' })}
            </MenuItem>
          ))}
      </Select>

      <Select
        value={new Date(`01/01/${year}`).toLocaleDateString('en-US', { year: 'numeric' })}
        onChange={(e) => updateYear(e.target.value)}
        label="Year"
        size="small"
      >
        {availableYears
          .sort((a, b) => b - a)
          .map((yearValue) => (
            <MenuItem
              key={yearValue}
              value={new Date(`01/01/${yearValue}`).toLocaleDateString('en-US', {
                year: 'numeric',
              })}
            >
              {new Date(`01/01/${yearValue}`).toLocaleDateString('en-US', { year: 'numeric' })}
            </MenuItem>
          ))}
      </Select>
    </Stack>
  );
}
export default MonthYearPicker;
