import {
  format,
  getTime,
  formatDistance,
  formatDistanceToNow,
  formatDistanceStrict,
} from 'date-fns';

// ----------------------------------------------------------------------

export function fDate(date, newFormat) {
  const fm = newFormat || 'dd MMM yyyy';

  return date ? format(new Date(date), fm) : '';
}

export function fDateTime(date, newFormat) {
  const fm = newFormat || 'dd MMM yyyy p';

  return date ? format(new Date(date), fm) : '';
}

export function fTimestamp(date) {
  return date ? getTime(new Date(date)) : '';
}

export function fToNow(date) {
  return date
    ? formatDistanceToNow(new Date(date), {
        addSuffix: true,
      })
    : '';
}

export function fDistance(date1, date2) {
  return date1 && date2 ? formatDistance(date2, date1, { unit: 'minute' }) : '';
}
export function fDistanceStrict(date1, date2) {
  return date1 && date2 ? formatDistanceStrict(date2, date1, { unit: 'minute' }) : '';
}

export function calculateDistanceInNumbers(date1, date2) {
  if (!date1 || !date2) {
    return 0;
  }

  const distance = Math.abs(date2 - date1);
  const days = Math.ceil(distance / (1000 * 60 * 60 * 24));

  return days;
}
