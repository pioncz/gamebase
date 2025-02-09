import { createStitches } from '@stitches/react';

export const {
  styled,
  css,
  globalCss,
  keyframes,
  getCssText,
  theme,
  createTheme,
  config,
} = createStitches({
  theme: {
    colors: {},
    transitions: {
      1: 'all 0.2s ease-in-out',
    },
    space: {
      1: '4px',
      2: '8px',
      3: '12px',
      4: '18px',
      5: '24px',
    },
    fontSizes: {
      1: '14px',
      2: '18px',
      3: '24px',
    },
    radii: {
      0: '2px',
      1: '4px',
    },
    shadows: {
      1: '0px 0px 30px 0px rgba(0, 0, 0, .07), 0px 30px 60px 0px rgba(0, 0, 0, .26), inset 0px 0px 1px 0px hsla(0, 0%, 100%, .25)',
    },
    blurs: {
      1: 'blur(6px)',
    },
  },
  media: {
    bp1: '(min-width: 480px)',
  },
});
