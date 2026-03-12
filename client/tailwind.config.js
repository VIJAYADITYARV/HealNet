// Force rebuild tailwind JIT watcher
/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            colors: {
                brand: {
                    50: '#eef4ff',
                    100: '#d9e8ff',
                    200: '#bbd4ff',
                    300: '#8ab6ff',
                    400: '#528eff',
                    500: '#2563eb', // Trust Blue
                    600: '#1d4ed8',
                    700: '#1e40af',
                    800: '#1e3a8a',
                    900: '#1e3060',
                },
                health: {
                    50: '#edfdf4',
                    100: '#d1fae5',
                    200: '#a7f3d0',
                    300: '#6ee7b7',
                    400: '#34d399',
                    500: '#10b981', // Health Green
                    600: '#059669',
                    700: '#047857',
                    800: '#065f46',
                    900: '#064e3b',
                },
            },
            boxShadow: {
                'soft': '0 2px 15px -3px rgba(37,99,235,0.07), 0 10px 20px -2px rgba(37,99,235,0.04)',
                'card': '0 4px 24px -4px rgba(37,99,235,0.10), 0 20px 40px -8px rgba(0,0,0,0.06)',
                'card-hover': '0 8px 32px -4px rgba(37,99,235,0.18), 0 24px 48px -8px rgba(0,0,0,0.10)',
                'input-focus': '0 0 0 3px rgba(37,99,235,0.15)',
                'btn': '0 4px 14px 0 rgba(37,99,235,0.35)',
                'btn-hover': '0 6px 20px 0 rgba(37,99,235,0.45)',
            },
            animation: {
                'fade-up': 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both',
                'fade-in': 'fadeIn 0.3s ease both',
                'slide-down': 'slideDown 0.2s ease both',
                'spin-slow': 'spin 1.2s linear infinite',
            },
            keyframes: {
                fadeUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
                fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
                slideDown: { '0%': { opacity: '0', transform: 'translateY(-6px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
            },
        },
    },
    plugins: [],
}
