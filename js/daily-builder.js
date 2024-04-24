import { Intl } from '@js-temporal/polyfill';
import Calendar from './modules/calendar';
import { outline, days } from './modules/outline';
import { jsonIfOk, textIfOk } from './modules/fetch-helpers';
import { $ } from './modules/dom.js';

const cache = 'no-cache';

const CALENDAR = '../calendar/calendar.json';
const OUTLINE = '../calendar/outline.txt';

let dateFormatOpts = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};

const dateFormatter = new Intl.DateTimeFormat("en-US", dateFormatOpts);

const loadData = async (calendarFile, outlineFile) => {
  fillTable(
    await fetch(calendarFile, { cache }).then(jsonIfOk).then((x) => new Calendar(x)),
    await fetch(outlineFile, { cache }).then(textIfOk).then((x) => outline(x)),
  );
};

const fillTable = (calendar, outline) => {
  const div = $('#days');
  const template = $('#oneDay');

  days(outline).forEach((d, i) => {
    const clone = template.content.cloneNode(true);
    let divs = clone.querySelectorAll("div > div");
    divs[0].append($('<span>',  dateFormatter.format(calendar.nthSchoolDay(i))));
    fillSecondSpan(divs[1], d.doNow);
    fillSecondSpan(divs[2], d.after);
    fillSecondSpan(divs[3], d.duringClass);
    fillSecondSpan(divs[4], d.exitTicket);
    if (d.extra) {
      fillSecondSpan(divs[5], d.extra);
    } else {
      divs[5].remove();
    }

    div.append(clone);
  });
};

const fillSecondSpan = (div, value) => {
  const span = div.querySelectorAll("span")[1];
  if (value) {
    if (typeof value === 'string') {
      span.textContent = value;
    } else {
      span.replaceChildren(toList(value));
    }
  } else {
    span.textContent = '-';
  }
};

const toList = (value) => {
  console.log(value);
  const ul = $('<ul>');
  value.forEach(i => {
    const li = $('<li>');
    li.append(i.title);
    if (i.children) {
      li.append(toList(i.children));
    }
    ul.append(li);
  });
  return ul;
}


loadData(CALENDAR, OUTLINE);
