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

module.exports = {
  drawBoard,
};