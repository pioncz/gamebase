const drawSquareField = (
  canvas,
  color,
  disabled,
  size = canvas.width / gridSize,
  x,
  z,
  radius = 5,
  background,
  stroke,
) => {
  const ctx = canvas.getContext('2d');
  const cellSize = size;
  const cellX = x * cellSize;
  const cellZ = z * cellSize;

  const drawSquare = (cellX, cellZ, size, radius, background) => {
    ctx.beginPath();
    ctx.moveTo(cellX + radius, cellZ);
    ctx.lineTo(cellX + size - radius, cellZ);
    ctx.quadraticCurveTo(cellX + size, cellZ, cellX + size, cellZ + radius);
    ctx.lineTo(cellX + size, cellZ + size - radius);
    ctx.quadraticCurveTo(cellX + size, cellZ + size, cellX + size - radius, cellZ + size);
    ctx.lineTo(cellX + radius, cellZ + size);
    ctx.quadraticCurveTo(cellX, cellZ + size, cellX, cellZ + size - radius);
    ctx.lineTo(cellX, cellZ + radius);
    ctx.quadraticCurveTo(cellX, cellZ, cellX + radius, cellZ);
    ctx.closePath();

    ctx.fillStyle = background;
    ctx.fill();
  };

  drawSquare(
    x * cellSize,
    z * cellSize,
    cellSize, 
    radius, 
    stroke,
  );
  drawSquare(
    x * cellSize + 7.5,
    z * cellSize + 7.5,
    cellSize - 15, 
    radius, 
    background,
  );
};

module.exports = {
  drawSquareField,
};