import { Temporal } from '@js-temporal/polyfill';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const dayName = (d) => DAY_NAMES[d.dayOfWeek - 1];

const monthName = (d) => MONTH_NAMES[d.month - 1];

const { from: date, compare } = Temporal.PlainDate;

const between = (start, d, end) => compare(start, d) <= 0 && compare(d, end) <= 0;

class Calendar {
  constructor(data) {
    this.firstDay = date(data.firstDay);
    this.lastDay = date(data.lastDay);
    this.startOfSummer = this.lastDay.add({ days: 1 });
    this.apExams = {
      start: date(data.apExams.start),
      end: date(data.apExams.end),
    };
    this.holidays = new Set(data.holidays.map((d) => date(d).toString()));
    Object.assign(this, this.parseYear());
  }

  parseYear() {
    const startOfSummer = this.lastDay.add({ days: 1 });
    const elements = [];

    const daysOfYear = [];

    let daysOff = 0;
    let days = [];
    let d = this.firstDay;

    let w = 1;
    while (!d.equals(startOfSummer)) {
      if (this.isSchoolday(d)) {
        daysOfYear.push(d);
        if (daysOff > 0) {
          elements.push(new Week(days, w++, this.apExams));
          days = [];
          if (daysOff > 4) {
            elements.push(new Vacation(daysOff, d));
          }
        }
        days.push(d);
        daysOff = 0;
      } else {
        daysOff++;
      }
      d = d.add({ days: 1 });
    }
    elements.push(new Week(days, w, this.apExams));
    return { elements, daysOfYear };
  }

  get schoolWeeks() {
    return this.elements.reduce((acc, w) => acc + (w.isWeek ? 1 : 0), 0);
  }

  get schoolDays() {
    return this.daysOfYear.length;
  }

  isHoliday(d) {
    return this.holidays.has(d.toString());
  }

  isSchoolday(d) {
    return d.dayOfWeek < 6 && !this.isHoliday(d);
  }

  nthSchoolDay(n) {
    return this.daysOfYear[n];
  }
}

class Week {
  constructor(days, number, apExams) {
    this.days = days;
    this.number = number;
    this.start = days[0];
    this.end = days[days.length - 1];
    this.isAP = days.some((d) => between(apExams.start, d, apExams.end));
    this.schoolDays = days.length;
  }

  isWeek = true;

  weekstring() {
    return `${this.daysOfWeek()} (${this.datesOfWeek()})`;
  }

  daysOfWeek() {
    return `${dayName(this.start)}-${dayName(this.end)}`;
  }

  datesOfWeek() {
    return this.start.month === this.end.month
      ? `${monthName(this.start)} ${this.start.day}-${this.end.day}`
      : `${monthName(this.start)} ${this.start.day}-${monthName(this.end)} ${this.end.day}`;
  }

  dump(dumper) {
    dumper.week(this);
  }
}

class Vacation {
  constructor(daysOff, dayAfter) {
    this.daysOff = daysOff;
    this.dayAfter = dayAfter;
  }

  isWeek = false;

  vacationString() {
    return `${this.vacationLabel()} (${this.daysOff} days)`;
  }

  vacationLabel() {
    switch (this.dayAfter.month) {
      case 11:
        return 'THANKSGIVING BREAK';
      case 1:
        return 'WINTER BREAK';
      case 2:
        return 'PRESIDENTS’ DAY WEEKEND';
      default:
        return 'SPRING BREAK';
    }
  }

  dump(dumper) {
    dumper.vacation(this);
  }
}

export default Calendar;
