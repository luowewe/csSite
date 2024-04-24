import Calendar from './modules/calendar';
import { outline, units } from './modules/outline';
import { jsonIfOk, textIfOk } from './modules/fetch-helpers';

const ITEM = Symbol('item');

const details = document.getElementById('details');

const loadData = async (calendar, outline) => {
  fillTable(
    await toCalendar(fetch(calendar)),
    await toOutline(fetch(outline, { cache: 'no-cache' })),
  );

  // Hack to prevent highlighting the A element when we load the page. Maybe better fixed via CSS?
  document.querySelectorAll('a').forEach((a) => {
    a.onfocus = (e) => {
      e.preventDefault();
      e.currentTarget.blur();
    };
  });

  if (window.location.hash) {
    /* eslint-disable no-self-assign */
    // Need to reset location now that the anchors are defined.
    window.location = window.location;
    /* eslint-enable */
  }
};

const toCalendar = (fetched) => fetched.then(jsonIfOk).then((x) => new Calendar(x));

const toOutline = (fetched) => fetched.then(textIfOk).then((x) => outline(x));

const tocLink = (unit) =>
  element('a', `${unit.number}`, {
    class: 'internal-link',
    href: `#unit-${unit.number}`,
  });

const fillTable = (calendar, outline) => {
  const { schoolWeeks, schoolDays } = calendar;

  const weeks = [...calendar.elements];
  const toc = document.getElementById('toc');
  const calendarDiv = document.getElementById('calendar');

  let unitWeeks = 0;
  let lastNumber = -1;

  units(outline).forEach((unit) => {
    addUnitSections(unit, toc, calendarDiv, weeks);
    unitWeeks += unit.weeks;
    lastNumber = unit.number;
  });

  if (unitWeeks < schoolWeeks) {
    const placeholder = {
      title: "Unscheduled",
      weeks: schoolWeeks - unitWeeks,
      type: "unit",
      number: (lastNumber + 1) + '*',
      children: [],
    };
    addUnitSections(placeholder, toc, calendarDiv, weeks);

  } else if (unitWeeks > schoolWeeks) {
    const p = document.createElement('p');
    p.classList.add('overflow-warning');
    const s = Math.abs(unitWeeks - schoolWeeks) == 1 ? '' : 's';
    if (unitWeeks < schoolWeeks) {
      p.innerText = `Underflow by ${schoolWeeks - unitWeeks} week${s}.`;
    } else {
      p.innerText = `Overflow by ${unitWeeks - schoolWeeks} week${s}.`;
    }
    calendarDiv.before(p);
  }

  document.getElementById(
    'length',
  ).innerText = `${schoolWeeks} school weeks; ${schoolDays} school days`;
};

const addUnitSections = (unit, toc, calendarDiv, weeks) => {

  toc.appendChild(tocLink(unit));

  let section = element('section');

  const toFill = weeksForUnit(unit, weeks);

  const lessons = [...unit.children];

  let first = true

  toFill.forEach((e) => {
    if (e.isWeek) {
      if (first) {
        section.appendChild(unitRow(unit));
      }
      section.appendChild(weekRow(e, calendar, lessons));
      first = false;
    } else {
      if (section.children.length > 0) {
        calendarDiv.appendChild(section);
        section = element('section');
      }
      calendarDiv.appendChild(vacationRow(e));
    }
  });

  if (lessons.length > 0) {
    const p = document.createElement('p');
    p.classList.add('overflow-warning');
    console.log(JSON.stringify(lessons));
    const over = lessons.reduce((tot, l) => tot + l.days, 0);
    p.innerText = `Overflow -- days: ${over}; lessons: ${lessons.length}`;
    section.append(p);
  }

  calendarDiv.appendChild(section);
};

const weeksForUnit = (unit, weeks) => {
  const ws = [];
  for (let count = 0; count < unit.weeks; ) {
    const w = weeks.shift();
    if (!w) break;

    if (w.isWeek) count++;
    ws.push(w);
  }
  return ws;
}


const unitRow = (unit) => {
  const row = div(unitAnchor(unit), { class: 'unit' });
  row.append(unitSelfLink(unit));
  row.append(element('a', '↑', { href: '#', class: 'up' }));
  return row;
};

const unitAnchor = (unit) => {
  const name = `unit-${unit.number}`;
  return element('a', '', { class: 'anchor', name });
};

const unitSelfLink = (unit) => {
  const { number, title, weeks } = unit;
  const href = `#unit-${number}`;
  const weeksLabel = `${weeks} week${weeks !== 1 ? 's' : ''}`;
  return element('a', `Unit ${number}: ${title} (${weeksLabel})`, { class: 'internal-link', href });
};

const weekRow = (w, calendar, lessons) => {
  const row = div('', { class: 'week' });
  const daysDiv = div('', { class: 'days' });

  row.appendChild(dateCell(w));
  row.appendChild(daysDiv);

  if (w.start.dayOfWeek > 1) {
    daysOff(daysDiv, w.start.dayOfWeek - 1);
  }

  let days = w.days.length;

  while (days > 0 && lessons.length > 0) {
    const item = lessons.shift();
    const consumed = Math.min(days, item.days);

    if (item.title && item.title !== 'Unscheduled') {
      scheduled(daysDiv, item, consumed);
    } else {
      unscheduled(daysDiv, consumed);
    }
    if (consumed < item.days) {
      lessons.unshift({ ...item, days: item.days - consumed, continuation: true });
    }
    days -= consumed;
  }
  if (days > 0) unscheduled(daysDiv, days);
  if (w.end.dayOfWeek < 5) {
    daysOff(daysDiv, 5 - w.end.dayOfWeek);
  }
  return row;
};

const dateCell = (w) => {
  if (w.isAP) {
    const cell = div('');
    cell.innerHTML = `${w.datesOfWeek()}<br><span class='extra'>AP exams</span>`;
    return cell;
  } else {
    return div(w.datesOfWeek());
  }
};

const daysOff = (row, n=1) => {
  row.appendChild(div('No school', { class: 'off', 'data-days': n }));
};

const scheduled = (daysDiv, item, days) => {
  let c = 'scheduled';
  if ('type' in item) c += ` ${item.type}`;
  if (item.continuation) c += ' continuation';
  const cell = div(p(item.title), { class: c, 'data-days': days });
  daysDiv.appendChild(cell);
  cell[ITEM] = item;
  if (localStorage.getItem('showOutlineDetails') === 'yes') {
    cell.onclick = showDetails;
  }
};

const fillDetails = (item, div) => {
  const h1 = document.createElement('h1');
  h1.innerText = item.title;
  div.append(h1);

  if (item.children) {
    div.append(itemsDetails(item.children));
  } else {
    const p = document.createElement('p');
    p.innerText = 'No details.';
    div.append(p);
  }
};

const itemsDetails = (items) => {
  const ul = document.createElement('ul');
  items.forEach((item) => {
    const li = document.createElement('li');
    li.innerText = item.title;
    if (item.children) {
      li.append(itemsDetails(item.children));
    }
    ul.appendChild(li);
  });
  return ul;
};

const unscheduled = (daysDiv, days) => {
  daysDiv.appendChild(div('Unscheduled', { class: 'unscheduled', 'data-days': days }));
};

const showDetails = (e) => {
  details.replaceChildren();
  fillDetails(e.target[ITEM], details);
  details.style.display = 'block';
  e.stopPropagation();
};

const hideDetails = (e) => {
  details.style.display = 'none';
};

const vacationRow = (v) => section(div(v.vacationString()), { class: 'vacation' });

const section = (content, attributes) => element('section', content, attributes);

const div = (content, attributes) => element('div', content, attributes);

const p = (content, attributes) => element('p', content, attributes);

const element = (tag, content, attributes = {}) => {
  const e = document.createElement(tag);
  if (content) {
    if (typeof content === 'string') {
      e.innerText = content;
    } else {
      e.appendChild(content);
    }
  }
  Object.entries(attributes).forEach(([name, value]) => {
    e.setAttribute(name, value);
  });
  return e;
};

window.document.documentElement.onclick = () => {
  if (details.style.display !== 'none') {
    details.style.display = 'none';
  }
};

window.onkeydown = (e) => {
  if (e.key === 'Escape' && details.style.display !== 'none') {
    details.style.display = 'none';
  }
};

loadData('calendar.json', 'outline.txt');
