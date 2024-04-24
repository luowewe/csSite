const FIRST_UNIT_NUMBER = 0;

const peek = (stack) => stack[stack.length - 1];

/*
 * Translate raw lines into virtual lines that allow for wrapped lines indented
 * the way Emacs indents them.
 */

/* eslint-disable no-restricted-syntax */
function* lines(data) {
  let current = null;
  let continuationPat = null;

  const raw = data.split(/\r?\n/).filter((s) => s.length > 0);

  for (const line of raw) {
    const m = line.match(/^(\s*)-\s+(.*?)\s*$/);
    if (m) {
      // Matches the beginning of an item
      if (current !== null) yield current;
      const [indent, text] = m.slice(1);
      current = `${indent}- ${text}`;
      continuationPat = new RegExp(String.raw`^${indent} ( \S.*)\s*$`);
    } else if (continuationPat !== null) {
      const m = line.match(continuationPat);
      if (m) {
        // Matches a continuation of the current item.
        const [text] = m.slice(1);
        current += text;
      }
    }
    // Everything else is ignored.
  }
  if (current !== null) yield current;
}
/* eslint-enable */

/*
 * Parse a virtual line returned by lines into an item.
 */
const parseLine = (s) => {
  const match = s.match(/^(\s*)-\s+(.*?)(?: \(((?:0\.)?\d+(?: (weeks?))?)\))?\s*$/);
  if (match) {
    const [indent, text, days, weeks] = match.slice(1);
    const parsed = {
      level: indent.length,
      text,
    };
    if (days) {
      if (weeks) {
        parsed.weeks = Number.parseFloat(days, 10);
      } else {
        parsed.days = Number.parseFloat(days, 10);
      }
    }
    return parsed;
  } else {
    throw new Error(`Malformed outline line: '${s}'`);
  }
};

/*
 * Build the full outline by parsing the given text.
 */
const outline = (text) => {
  // Stack contains the objects currenly being built with their level of
  // indentation. When we see a new line we want to add it to the first item on
  // the stack that is less indented than the current line. So we pop items off
  // the stack until the top of the stack meets that criteria and then add the
  // item representing the current line as a child of the current top of the
  // stack and then push this item (with it's indentation) onto the stack.

  // Dummy item that is less indented than all actual lines.
  const stack = [{ level: -1, item: { children: [] } }];

  let unitNum = FIRST_UNIT_NUMBER;

  /* eslint-disable no-restricted-syntax */
  for (const line of lines(text)) {
    const p = parseLine(line);

    while (peek(stack).level >= p.level) {
      stack.pop();
    }

    const newItem = { title: p.text, days: p.days, weeks: p.weeks };
    if (newItem.title.match(/^Project: /)) {
      newItem.type = 'project';
      newItem.title = newItem.title.substring('Project: '.length);
    }

    let m = undefined;
    if (m = newItem.title.match(/^Unit(?: (.*?))?:\s+(.*)$/)) {
      newItem.type = 'unit';
      if (m[1]) {
        // If there's an explicit number use it.
        newItem.number = m[1];
        const num = Number.parseInt(m[1]);
        if (Number.isInteger(num)) {
          // And if it's an integer also make it reset unitNum
          unitNum = num + 1;
        }
      } else {
        newItem.number = unitNum++;
      }
      newItem.title = m[2];
    } else if (newItem.title.match(/^Assessment: /)) {
      newItem.type = 'assessment';
      newItem.title = newItem.title.substring('Assessment: '.length);
    } else if (newItem.title.match(/^No class: /)) {
      newItem.type = 'no-class';
      newItem.title = newItem.title.substring('No class: '.length);
    }

    const top = peek(stack).item;
    if (!('children' in top)) {
      top.children = [];
    }
    top.children.push(newItem);
    stack.push({ level: p.level, item: newItem });
  }
  /* eslint-enable */

  // Close all open items by clearing the stack back down to dummy item.
  while (peek(stack).level >= 0) {
    stack.pop();
  }
  return peek(stack).item.children;
};

/*
 * From a list of items build a schedule of those items with days specified.
 */
const schedule = (items) => {
  const withDays = (item, prefix) => {
    if (item.days) {
      return [addPrefix(item, prefix)];
    } else if (item.children) {
      return item.children.flatMap((x) => withDays(x, prefixed(prefix, ''/*item.title*/)));
    } else {
      return [];
    }
  };

  return items.flatMap((x) => withDays(x, ''));
};

/*
 * Get the top-level units and their scheduled children.
 */
const units = (full) =>
  full
    .filter((u) => u.type === 'unit')
      .map((unit) => ({ ...unit, children: schedule(unit.children || []) }));

const days = (full) => full.flatMap(x => daysOf(x));

const daysOf = (x) => x.title === "Day:" ? [parseDay(x)] : x.children?.flatMap(c => daysOf(c)) ?? [];

const parseDay = (d) => {
  return {
    doNow: labeledTitle(d.children, "DO NOW"),
    after: labeledTitle(d.children, "AFTER"),
    duringClass: labeledTitle(d.children, "DURING CLASS"),
    exitTicket: labeledTitle(d.children, "EXIT TICKET"),
    extra: labeledTitle(d.children, "EXTRA"),
  };
};

const labeledTitle = (children, label) => {
  const entry = children.find(c => c.title.startsWith(label));
  if (entry) {
    if (entry.title.length > (label.length + 2)) {
      return entry.title.substring(label.length + 2);
    } else {
      return entry.children;
    }
  }
}

/*
 * Strip the tree down to only those items that are not scheduled. An item is
 * considered scheduled if it has days assigned or if all its children are
 * scheduled, recursively.
 */
const unscheduled = (nodes) => {
  const removeScheduledChildren = (n) => {
    if ('children' in n) {
      const children = unscheduled(n.children);
      return children.length > 0 ? [{ ...n, children }] : [];
    } else {
      return [n];
    }
  };

  return nodes.flatMap((n) => (n.days ? [] : removeScheduledChildren(n)));
};

const addPrefix = (item, prefix) => ({ ...item, title: prefixed(prefix, item.title) });

const prefixed = (prefix, text) => (prefix ? `${prefix}: ${text}` : text);

export { outline, schedule, units, unscheduled, days };
