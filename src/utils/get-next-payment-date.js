export function addOneMonth(date = new Date()) {
  // Get the current month and year
  let month = date.getMonth();
  let year = date.getFullYear();

  // Calculate the next month
  month = (month + 1) % 12;

  // Check if the next month is January (0), increment the year
  if (month === 0) {
    // eslint-disable-next-line no-plusplus
    year++;
  }

  // Calculate the number of days in the next month
  const nextMonthDays = new Date(year, month + 1, 0).getDate();

  // Get the current day
  let day = date.getDate();

  // If the current day exceeds the number of days in the next month,
  // set it to the last day of the next month
  if (day > nextMonthDays) {
    day = nextMonthDays;
  }

  // Create the new date
  const nextMonthDate = new Date(year, month, day);

  return nextMonthDate;
}

// ----------------------------------------------------------------------------

export function addOneYear() {
  const newDate = new Date();
  newDate.setFullYear(newDate.getFullYear() + 1);
  return newDate;
}
