import localFont from 'next/font/local';

export const fontSans = localFont({
  variable: '--font-sans',
  src: [
    // Light 300
    {
      path: '../assets/fonts/Lato-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../assets/fonts/Lato-LightItalic.woff2',
      weight: '300',
      style: 'italic',
    },

    // Regular 400
    {
      path: '../assets/fonts/Lato-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../assets/fonts/Lato-Italic.woff2',
      weight: '400',
      style: 'italic',
    },

    // Bold 700
    {
      path: '../assets/fonts/Lato-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../assets/fonts/Lato-BoldItalic.woff2',
      weight: '700',
      style: 'italic',
    },

    // Black 900
    {
      path: '../assets/fonts/Lato-Black.woff2',
      weight: '900',
      style: 'normal',
    },
    {
      path: '../assets/fonts/Lato-BlackItalic.woff2',
      weight: '900',
      style: 'italic',
    },
  ],
});

export const fontMono = fontSans;
