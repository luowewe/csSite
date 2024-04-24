const { Temporal } = require('@js-temporal/polyfill');

const MONTHS = [
  undefined,
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAYS = [
  undefined,
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const tz = Temporal.TimeZone.from('America/New_York');

const toLocalDateTime = (zdt) => zdt.toPlainDateTime().toZonedDateTime(tz);

// For now just hardwire some formats.
const formats = {
  yyyymmdd(local) {
    const yyyy = local.year;
    const mm = local.month.toString().padStart(2, '0');
    const dd = local.day.toString().padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  },

  hhmm(local) {
    const h = local.hour;
    const hh = (((h + 11) % 12) + 1).toString().padStart(2, '0');
    const mm = local.minute.toString().padStart(2, '0');
    const ampm = h >= 12 ? 'pm' : 'am';
    return `${hh}:${mm} ${ampm}`;
  },

  hhmm24(local) {
    const h = local.hour;
    const hh = h.toString().padStart(2, '0');
    const mm = local.minute.toString().padStart(2, '0');
    return `${hh}:${mm}`;
  },

  humandate(local) {
    const day = DAYS[local.dayOfWeek];
    const month = MONTHS[local.month];
    const date = local.day;
    const year = local.year;
    return `${day}, ${month} ${date}, ${year}`;
  },

  humandatetime(local) {
    const day = DAYS[local.dayOfWeek];
    const month = MONTHS[local.month];
    const date = local.day;
    const year = local.year;
    return `${day}, ${month} ${date}, ${year} ${this.hhmm(local)}`;
  },

  shortdatetime(local) {
    const day = DAYS[local.dayOfWeek].slice(0, 3);
    const month = local.month;
    const date = local.day;
    const year = local.year;
    return `${day}, ${month}/${date} ${this.hhmm(local)}`;
  },

  datetimeLocal(local) {
    return `${this.yyyymmdd(local)}T${this.hhmm24(local)}`;
  },
};

/*
 * The filter. Installed as 'date` by default.
 */
const date = (time, fmt) => {
  if (!time) {
    return '-';
  } else {
    // Eleventy parses dates in metadata in UTC. But we want it to be in Pacific
    // time so we translate the specific instant Eleventy decided a string like
    // 2023-08-16 into a UTC time from which we strip the timezone info and then
    // put it into Pacific time zone.
    const instant = Temporal.Instant.fromEpochMilliseconds(time);
    const zdt = instant.toZonedDateTimeISO('UTC');
    const local = zdt.toPlainDateTime().toZonedDateTime(tz);
    if (fmt in formats) {
      return formats[fmt](local);
    } else {
      return local.toLocaleString('en-US', { calendar: 'gregory' });
    }
  }
};

/*
 * Install the date filter under its default name.
 */
const install = (env) => {
  env.addFilter('date', date);
};

module.exports = date;
