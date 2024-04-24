const canvas = document.querySelector('canvas');
const r = canvas.parentElement.getBoundingClientRect();
canvas.setAttribute('width', r.width - 2);
canvas.setAttribute('height', r.height - 2);
