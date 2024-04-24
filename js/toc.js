// Set up links and toc.

const slugify = (s) => s.toLowerCase().replaceAll(/\s+/g, '-');

const toc = document.getElementById('toc');
if (toc) {
  document.querySelectorAll('a').forEach((a) => {
    if (a.getAttribute('name') === '') {
      a.setAttribute('name', slugify(a.innerText));
      a.setAttribute('href', `#${a.getAttribute('name')}`);
      const li = document.createElement('li');
      const a2 = document.createElement('a');
      a2.setAttribute('href', `#${a.getAttribute('name')}`);
      a2.innerHTML = a.innerHTML;
      li.append(a2);
      toc.append(li);
    }
  });
}
