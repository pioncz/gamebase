export const bindSelectors = (slicer, selectors) => Object.keys(selectors)
  .reduce((current, key) => ({
    ...current,
    [key]: (state, ...args) => selectors[key](slicer(state), ...args),
  }), {});

export const parseLogic = logic => Object.keys(logic).map(key => logic[key]);
