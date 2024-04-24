//
// Notes:
//
//  - Factor out all new functions to the top level of the file, i.e. not nested
//    within other functions.
//
//  - Do not introduce any new global variables. Write your new functions to
//    take the values they need as arguments and then pass them when you call
//    the function.
//
//  - When you are done you should still have a drawPicture function and the
//    call to it at the bottom of the file should be unchanged. The thing that
//    should have changed is drawPicture should be much shorter, having been
//    rewritten in terms of new functions you have defined.
//

const drawPicture = (horizon) => {
  const sunSize = 100;
  const sunRays = 6;
  const sunRayProportion = 2;
  const sunRayWidth = 7;
  const smallCloudSize = 25;
  const bigCloudSize = 35;
  const numTrees = 5;
  const trunkWidth = 20;
  const trunkHeight = 55;
  const leavesRadius = 40;
  const minApples = 5;
  const maxApples = 8;
  const appleRadius = 6;

  // Draw sky
  drawFilledRect(0, 0, width, horizon, 'skyblue');

  // Draw ground
  drawFilledRect(0, horizon, width, horizon, 'green');

  // Draw the sun. The sun is always at top right and the way we draw the rays
  // depends on that.
  drawFilledCircle(width, 0, sunSize, 'yellow');

  // Draw the sun's rays.
  const startAngle = (Math.PI / 2) * 0.023;
  const r = ((Math.PI / 2) - 2 * startAngle) / (sunRays - 1);
  for (let i = 0; i < sunRays; i++) {
    const angle = startAngle + Math.PI + (i * r);
    const x2 = width + sunSize * sunRayProportion * Math.cos(angle);
    const y2 = 0 - sunSize * sunRayProportion * Math.sin(angle);
    drawLine(width, 0, x2, y2, 'yellow', sunRayWidth);
  }

  // Draw small cloud
  let x = width * 0.1;
  let y = height * 0.2;
  drawFilledCircle(x, y, smallCloudSize, 'white');
  drawFilledCircle(x + smallCloudSize * 2.5, y, smallCloudSize, 'white');
  drawFilledCircle(x+ (smallCloudSize * 1.25), y - smallCloudSize * 0.5, smallCloudSize, 'white');
  drawFilledCircle(x+ (smallCloudSize * 1.25), y + smallCloudSize * 0.5, smallCloudSize, 'white');

  // Draw big cloud
  x = width * 0.5;
  drawFilledCircle(x, y, bigCloudSize, 'white');
  drawFilledCircle(x + bigCloudSize * 2.5, y, bigCloudSize, 'white');
  drawFilledCircle(x+ (bigCloudSize * 1.25), y - bigCloudSize * 0.5, bigCloudSize, 'white');
  drawFilledCircle(x+ (bigCloudSize * 1.25), y + bigCloudSize * 0.5, bigCloudSize, 'white');

  // Draw trees
  const gap = width / (numTrees + 1);
  const treeBaseY = horizon * 1.1;
  for (let i = 0; i < numTrees; i++) {
    // Draw one tree
    const treeBaseX = (i + 1) * gap;
    const leavesX = treeBaseX + trunkWidth / 2;
    const leavesY = treeBaseY - trunkHeight - (leavesRadius - 2);
    const numApples = minApples + Math.floor(Math.random() * (maxApples - minApples));

    // Draw trunk
    drawFilledRect(treeBaseX, treeBaseY - trunkHeight, trunkWidth, trunkHeight, 'sienna');

    // Draw leaves
    drawFilledCircle(leavesX, leavesY, leavesRadius, 'forestgreen');

    // Draw apples
    let r = appleRadius;
    drawFilledCircle(leavesX + -r / 2 + Math.random() * r, leavesY + -r / 2 + Math.random() * r, r, 'crimson');
    for (let i = 0; i < numApples; i++) {
      const angle = i * ((Math.PI * 2) / numApples);
      const d = leavesRadius - appleRadius * 1.25 - (Math.random() * appleRadius * 2);
      const ax = leavesX + d * Math.cos(angle);
      const ay = leavesY + d * Math.sin(angle);
      drawFilledCircle(ax + -r / 2 + Math.random() * r, ay + -r / 2 + Math.random() * r, r, 'crimson');
    }
  }
};

drawPicture(height * 0.78);
