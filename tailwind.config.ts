import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					light: 'hsl(var(--primary-light))',
					mid: 'hsl(var(--primary-mid))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))',
					soft: 'hsl(var(--success-bg))',
					fg: 'hsl(var(--success-fg))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					soft: 'hsl(var(--warning-bg))',
					fg: 'hsl(var(--warning-fg))'
				},
				info: {
					DEFAULT: 'hsl(var(--info))',
					soft: 'hsl(var(--info-bg))',
					fg: 'hsl(var(--info-fg))'
				},
				'destructive-soft': {
					DEFAULT: 'hsl(var(--destructive-bg))',
					fg: 'hsl(var(--destructive-fg))'
				},
				chip: {
					pink:   { DEFAULT: 'hsl(var(--chip-pink))',   soft: 'hsl(var(--chip-pink-bg))',   fg: 'hsl(var(--chip-pink-fg))' },
					purple: { DEFAULT: 'hsl(var(--chip-purple))', soft: 'hsl(var(--chip-purple-bg))', fg: 'hsl(var(--chip-purple-fg))' },
					cyan:   { DEFAULT: 'hsl(var(--chip-cyan))',   soft: 'hsl(var(--chip-cyan-bg))',   fg: 'hsl(var(--chip-cyan-fg))' },
					teal:   { DEFAULT: 'hsl(var(--chip-teal))',   soft: 'hsl(var(--chip-teal-bg))',   fg: 'hsl(var(--chip-teal-fg))' },
					indigo: { DEFAULT: 'hsl(var(--chip-indigo))', soft: 'hsl(var(--chip-indigo-bg))', fg: 'hsl(var(--chip-indigo-fg))' },
					orange: { DEFAULT: 'hsl(var(--chip-orange))', soft: 'hsl(var(--chip-orange-bg))', fg: 'hsl(var(--chip-orange-fg))' }
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;