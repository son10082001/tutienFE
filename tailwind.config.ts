/* eslint-disable global-require */
const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1360px',
      '3xl': '1440px',
    },
    container: {
      center: true,

      padding: {
        DEFAULT: '1rem',
      },
    },
    extend: {
      transitionProperty: {
        'height-opacity': 'max-height, opacity',
        'width-opacity': 'max-width, opacity',
      },
      maxHeight: {
        '0': '0',
        full: '1000px',
      },
      transitionWidthProperty: {
        'height-opacity': 'max-width, opacity',
      },
      fontSize: {
        xxs: '0.625rem',
        sm: ['14px', '20px'],
        base: ['16px', '20px'],
        h1Mobile: [
          '2.5rem',
          {
            fontWeight: '500',
            lineHeight: '3rem',
          },
        ],
        h2Mobile: [
          '2.25rem',
          {
            fontWeight: '500',
            lineHeight: '2.7rem',
          },
        ],
        h3Mobile: [
          '2rem',
          {
            fontWeight: '500',
            lineHeight: '2.4rem',
          },
        ],
        h4Mobile: [
          '1.5rem',
          {
            fontWeight: '500',
            lineHeight: '2.1rem',
          },
        ],
        h5Mobile: [
          '1.25rem',
          {
            fontWeight: '500',
            lineHeight: '1.75rem',
          },
        ],
        h6Mobile: [
          '1.125rem',
          {
            fontWeight: '500',
            lineHeight: '1.575rem',
          },
        ],
        h1: [
          '3.5rem',
          {
            fontWeight: '500',
            lineHeight: '4.2rem',
          },
        ],
        h2: [
          '3rem',
          {
            fontWeight: '500',
            lineHeight: '3.6rem',
          },
        ],
        h3: [
          '2.5rem',
          {
            fontWeight: '500',
            lineHeight: '3rem',
          },
        ],
        h4: [
          '2rem',
          {
            fontWeight: '500',
            lineHeight: '2.6rem',
          },
        ],
        h5: [
          '1.5rem',
          {
            fontWeight: '500',
            lineHeight: '2.1rem',
          },
        ],
        h6: [
          '1.25rem',
          {
            fontWeight: '500',
            lineHeight: '1.75rem',
          },
        ],
        large: ['1.25rem', '1.875rem'],
        medium: ['1.125rem', '1.6875rem'],
        regular: ['1rem', '1.5rem'],
        small: ['0.875rem', '1.3125rem'],
        tiny: ['0.75rem', '1.125rem'],
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans],
        serif: ['var(--font-serif)', ...fontFamily.serif],
        montserrat: ['var(--font-montserrat)', ...fontFamily.sans],
        poppins: ['var(--font-poppins)', ...fontFamily.sans],
      },
      flex: {
        full: '0 0 100%',
      },
      maxWidth: {
        dashboard: 'var(--dashboard-container)',
      },
      width: {
        sidebar: 'var(--w-sidebar)',
      },
      height: {
        header: 'var(--header-h)',
        headerMobile: 'var(--header-mobile-h)',
      },

      text: {
        large: {
          light: {
            fontSize: ['1.25rem'],
            fontWeight: ['300'],
            lineHeight: ['2.1rem'],
          },
        },
      },
      zIndex: {
        header: 999,
      },
      borderWidth: {
        DEFAULT: '1px',
        '0': '0',
        '2': '2px',
        '3': '3px',
        '4': '4px',
        '6': '6px',
        '8': '8px',
      },
      colors: {
        border: {
          DEFAULT: 'hsl(var(--border))',
        },
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        surface: 'hsl(var(--surface))',
        background: {
          DEFAULT: 'hsl(var(--background))',
        },
        foreground: 'hsl(var(--foreground))',
        baseBackground: '#191C1F',
        primary: {
          DEFAULT: 'hsla(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          background: '#0C111D',
          gray: {
            '25': '#FCFCFD',
            '50': '#F9FAFB',
            '100': '#F2F4F7',
            '200': '#EAECF0',
            '300': '#D0D5DD',
            '400': '#98A2B3',
            '500': '#667085',
            '600': '#475467',
            '700': '#344054',
            '800': '#182230',
            '900': '#101828',
            '950': '#0C111D',
          },
          brand: {
            '25': '#F5FCFE',
            '50': '#F5FCFE',
            '100': '#ECF9FE',
            '200': '#D9F4FD',
            '300': '#BCEBFB',
            '400': '#91DEF8',
            '500': '#44C8F3',
            '600': '#27BFF1',
            '700': '#0FB8F0',
            '800': '#0D9AC9',
            '900': '#0A7DA3',
            '950': '#075873',
          },
          error: {
            '25': '#FFFBFA',
            '50': '#FEF3F2',
            '100': '#FEE4E2',
            '200': '#FECDCA',
            '300': '#FDA29B',
            '400': '#F97066',
            '500': '#F04438',
            '600': '#D92D20',
            '700': '#B42318',
            '800': '#912018',
            '900': '#7A271A',
            '950': '#55160C',
          },
          warning: {
            '25': '#FFFCF5',
            '50': '#FFFAEB',
            '100': '#FEF0C7',
            '200': '#FEDF89',
            '300': '#FEC84B',
            '400': '#FDB022',
            '500': '#F79009',
            '600': '#DC6803',
            '700': '#B54708',
            '800': '#93370D',
            '900': '#7A2E0E',
            '950': '#4E1D09',
          },
          success: {
            '25': '#F6FEF9',
            '50': '#ECFDF3',
            '100': '#D1FADF',
            '200': '#ABF5D1',
            '300': '#7AE7C7',
            '400': '#47D9B3',
            '500': '#14B78F',
            '600': '#0E8074',
            '700': '#047857',
            '800': '#05614D',
            '900': '#054C3E',
            '950': '#033520',
          },
          pink: {
            '25': '#FEF6FB',
            '50': '#FDF2FA',
            '100': '#FCE7F6',
            '200': '#FCCEEE',
            '300': '#FAA7E0',
            '400': '#F670C7',
            '500': '#EE46BC',
            '600': '#DD2590',
            '700': '#C11574',
            '800': '#9E165F',
            '900': '#851651',
            '950': '#4E0D30',
          },
          orange: {
            '25': '#FEFAF5',
            '50': '#FEF6EE',
            '100': '#FDEAD7',
            '200': '#F9DBAF',
            '300': '#F7B27A',
            '400': '#F38744',
            '500': '#EF6820',
            '600': '#E04F16',
            '700': '#B93815',
            '800': '#932F19',
            '900': '#772917',
            '950': '#511C10',
          },
          purple: {
            '25': '#FAFAFF',
            '50': '#F4F3FF',
            '100': '#EBE9FE',
            '200': '#D9D6FE',
            '300': '#BDB4FE',
            '400': '#9B8AFB',
            '500': '#7A5AF8',
            '600': '#6938EF',
            '700': '#5925DC',
            '800': '#4A1FB8',
            '900': '#3E1C96',
            '950': '#27115F',
          },
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          light: 'hsl(var(--success-light))',
        },
        error: {
          DEFAULT: 'hsl(var(--error))',
          light: 'hsl(var(--error-light))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          light: 'hsl(var(--warning-light))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          light: 'hsl(var(--info-light))',
        },
        divider: 'hsl(var(--divider))',
        neutral: {
          '0': '#FFFFFF',
          '10': '#DADADA',
          '20': '#B5B5B5',
          '30': '#909090',
          '40': '#6B6B6B',
          '50': '#464646',
          '60': '#212121',
        },
        main: {
          DEFAULT: '#133C65',
          '0': '#ECF0F4',
          '10': '#DBE4ED',
          '20': '#DBE4ED',
          '30': '#B4D2F0',
          '40': '#6391C0',
          '50': '#133C65',
          '60': '#0B233A',
        },
        readonly: {
          DEFAULT: '#E6E6E6',
          border: '#B6B6B6',
        },
        transparent: 'transparent',
      },
      borderRadius: {
        '3xl': '36px',
        '2xl': '24px',
        xl: '16px',
        lg: '12px',
        md: '8px',
        sm: '4px',
        haft: '50%',
      },
      boxShadow: {
        active: '0 0 80px 0 rgba(0, 0, 0, 0.10)',
      },
      keyframes: {
        zoomOutFade: {
          '0%': { transform: 'scale(1)', opacity: 1 },
          '100%': { transform: 'scale(1.5)', opacity: 0 },
        },
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'zoom-out-fade': 'zoomOutFade 2s infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
};

export {};
