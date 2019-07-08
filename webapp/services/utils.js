const Utils = {
  isIos: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
};

export default Utils;