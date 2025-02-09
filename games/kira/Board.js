import * as GameBoard from './../game/Board.js';

export const drawBoard = (canvas) => {
  let ctx = canvas.getContext('2d'),
    width = canvas.width,
    height = canvas.height;

  ctx.clearRect(0, 0, width, height);

  // background
  var grd = ctx.createLinearGradient(0, 0, width, height);
  grd.addColorStop(0.1, '#dcd183');
  grd.addColorStop(0.4, '#ece3a1');
  grd.addColorStop(0.7, '#fde429');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, width, width);
};

export const drawField = (canvas, gridSize, field) => {
  const { x, z, color, disabled } = field;
  const radius = 5;
  let background = '#d7bb54';
  let stroke = 'rgba(0,0,0,.07)';

  if (color) {
    background = color;
    stroke = 'rgba(255,255,255,0.3)';
  }
  if (disabled) {
    background = '#bbb';
    stroke = 'rgba(255,255,255,0.3)';
  }

  GameBoard.drawSquareField(
    canvas,
    color,
    disabled,
    canvas.width / gridSize,
    x,
    z,
    radius,
    background,
    stroke,
  );
};
