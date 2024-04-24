import { $ } from './modules/dom';

const branchName = (pathname) => {
  if (pathname.startsWith('/')) pathname = pathname.substring(1);
  if (pathname.endsWith('/')) pathname = pathname.substring(0, pathname.length - 1);
  return pathname;
};
if ($('#branch-name')) {
  $('#branch-name').innerText = branchName(window.location.pathname);
}

// Create the event
const reflowPlease = new CustomEvent('reflowPlease');

const instructions = $('#instructions');
const hidden = $('#hidden');

const hideInstructions = () => {
  hidden.style.display = 'block';
  instructions.style.display = 'none';
};

const showInstructions = () => {
  hidden.style.display = 'none';
  instructions.style.display = 'block';

  // Kludge to tell Monaco to lay itself out again since for some reason it
  // doesn't otherwise. (It does fine when we hide the instructions and it gets
  // more space but when we reveal the instructions it doesn't shrink back
  // down.)
  window.dispatchEvent(reflowPlease);
};

if ($('#close')) {
  $('#close').onclick = hideInstructions;
  $('#close').nextElementSibling.prepend($('#close'));
}
if ($('#open')) {
  $('#open').onclick = showInstructions;

}
