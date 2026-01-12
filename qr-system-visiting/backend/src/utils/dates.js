const DAY_MS = 24 * 60 * 60 * 1000;

export const parseDateRange = ({ from, to }) => {
  const now = new Date();
  const defaultTo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59));
  const defaultFrom = new Date(defaultTo.getTime() - 29 * DAY_MS);

  const fromDate = from ? new Date(`${from}T00:00:00Z`) : defaultFrom;
  const toDate = to ? new Date(`${to}T23:59:59Z`) : defaultTo;

  return {
    fromDate,
    toDate
  };
};

export const buildDateSeries = (fromDate, toDate) => {
  const series = [];
  const cursor = new Date(Date.UTC(fromDate.getUTCFullYear(), fromDate.getUTCMonth(), fromDate.getUTCDate()));
  const end = new Date(Date.UTC(toDate.getUTCFullYear(), toDate.getUTCMonth(), toDate.getUTCDate()));

  while (cursor <= end) {
    series.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return series;
};
