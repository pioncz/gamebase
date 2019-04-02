const drawBoard = (canvas) => {
  let ctx = canvas.getContext('2d'),
    width = canvas.width,
    height = canvas.height;

  ctx.clearRect(0, 0, width, height);

  // background
  var grd = ctx.createLinearGradient(0, 0, width, height);
  grd.addColorStop(0, "#E0C3FC");
  grd.addColorStop(1, "#8EC5FC");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, width, width);
};

module.exports = {
  drawBoard,
};