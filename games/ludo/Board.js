const drawBoard = (canvas) => {
  let ctx = canvas.getContext('2d'),
    width = canvas.width,
    height = canvas.height;

  ctx.clearRect(0, 0, width, height);

  // background
  var grd = ctx.createLinearGradient(0, 0, width, height);
  grd.addColorStop(.1, "#0fb8ad");
  grd.addColorStop(.4, "#1fc8db");
  grd.addColorStop(.7, "#2cb5e8");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, width, width);
};

module.exports = {
  drawBoard,
};