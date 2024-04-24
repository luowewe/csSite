const drawPicture = (horizon, base, size) => {
  drawBackground(horizon);
  drawSnowman(width / 2, base, size, [3, 4, 5]);
};

const drawBackground = (horizon) => {
  drawFilledRect(0, 0, width, horizon, '#ddeeff');
  drawFilledRect(0, horizon, width, height, 'white');
  drawLine(0, horizon, width, horizon, '#bbb');
};

const drawSnowman = (x, base, size, proportions) => {
  const [headP, torsoP, buttP] = proportions;
  const total = proportions.reduce((tot, p) => tot + p, 0);

  const headSize = size * (headP / total);
  const torsoSize = size * (torsoP / total)
  const buttSize = size * (buttP / total);

  const headY = (base - size) + headSize / 2;
  const torsoY = headY + headSize / 2 + torsoSize / 2;
  const buttY = torsoY + torsoSize / 2 + buttSize / 2;

  drawHead(x, headY, headSize / 2);
  drawTorso(x, torsoY, torsoSize / 2)
  drawButt(x, buttY, buttSize / 2);
};

const drawHead = (x, y, size) => {
  drawSnowball(x, y, size);
  drawEyes(x, y, size * 0.25);
  drawNose(x, y, size * 0.8);
  drawMouth(x, y, size);
  drawHat(x, y, size);
};

const drawEyes = (x, y, spacing) => {
  drawCoal(x - spacing, y - spacing, 4);
  drawCoal(x + spacing, y - spacing, 4);
};

const drawNose = (x, y, length) => {
  drawFilledTriangle(x, y, x + length, y + length * 0.2, x, y + length * 0.3, 'orange');
};

const drawMouth = (x, y, size) => {
  for (let i = 0; i < 5; i++) {
    const dy = -2 * (2.1 ** Math.abs(i - 2));
    drawCoal(x - (i - 2.3) * size * 0.21, y + size * 0.65 + dy, 4);
  }
};

const drawHat = (x, y, size) => {
  const brimTop = y - size * 0.9;
  const brimWidth = size * 2.25;
  const brimHeight = brimWidth * 0.08;
  const hatWidth = brimWidth * 0.7;
  const hatHeight = size * 1.25;
  drawFilledRect(x - brimWidth / 2, brimTop, brimWidth, brimHeight, 'black');
  drawFilledRect(x - hatWidth / 2, brimTop - hatHeight, hatWidth, hatHeight, 'black');
};

const drawCoal = (x, y, size) => {
  drawFilledCircle(x, y, size, 'black');
};

const drawSnowball = (x, y, size) => {
  drawCircle(x, y, size + 2, 'black', 3);
  drawFilledCircle(x, y, size, 'white', 3);
};

const drawTorso = (x, y, size) => {
  drawSnowball(x, y, size);
  drawArms(x, y, size);
  drawButtons(x, y, size);
};

const drawButt = (x, y, size) => {
  drawSnowball(x, y, size);
};

const drawArms = (x, y, size) => {
  drawArm(x, y, size, 1);
  drawArm(x, y, size, -1);
};

const drawArm = (x, y, size, direction) => {
  const x1 = x + size * 0.6 * direction;
  const x2 = x + size * 2.35 * direction;
  drawLine(x1, y - size * 0.25, x2, y - size * 0.85, 'black', 3);
};

const drawButtons = (x, y, size) => {
  for (let i = 0; i < 3; i++) {
    drawCoal(x, y - size * 0.5 + i * size * 0.5, 4);
  }
};

drawPicture(height * 0.7, height * 0.9, height * 0.7);
