const Utils = {
  $: function(options) {
    let elemenet = options.element || 'div';

    return document.createElement(elemenet);
  }
}

export default Utils