const c = (v) => `rgb(var(--${v}) / <alpha-value>)`
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: { bg: c('bg'), surface: c('surface'), ink: c('ink'), muted: c('muted'), line: c('line'), accent: c('accent'), sand: c('sand'), onaccent: c('onaccent'), sun: c('sun'), danger: c('danger') },
      fontFamily: {
        serif: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
}
