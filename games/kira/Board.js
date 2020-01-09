const drawBoard = (canvas) => {
  let ctx = canvas.getContext('2d'),
    width = canvas.width,
    height = canvas.height;

  ctx.clearRect(0, 0, width, height);

  // background
  var grd = ctx.createLinearGradient(0, 0, width, height);
  grd.addColorStop(.1, "#dcd183");
  grd.addColorStop(.4, "#ece3a1");
  grd.addColorStop(.7, "#fde429");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, width, width);
};

const drawField = (
  canvas, 
  gridSize,
  field,
) => {
  const {
    x, z, color, disabled,
  } = field;
  const ctx = canvas.getContext('2d');
  const lineWidth = 4;
  let background = 'white';
  let stroke = 'rgba(0,0,0,.07)';

  if (color) {
    background = color;
    stroke = 'rgba(255,255,255,0.3)';
  }
  if (disabled) {
    background = '#bbb';
    stroke = 'rgba(255,255,255,0.3)';
  }

  ctx.beginPath();
  var cellSize = canvas.width / gridSize;
  var r = cellSize / 2 * 0.75;
  var r2 = cellSize / 2 * 0.60;
  let cellX = (x + 0.5) * cellSize,
    cellZ = (z + 0.5) * cellSize;

  ctx.arc(cellX, cellZ, r, 0, 2 * Math.PI);
  ctx.fillStyle = background;
  ctx.fill();
  ctx.save();
  ctx.clip();

  ctx.arc(cellX, cellZ, r2, 0, 2 * Math.PI);
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = stroke;

  ctx.stroke();
  ctx.restore();
};

module.exports = {
  drawBoard,
  drawField,
};