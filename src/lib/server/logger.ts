const colors = {
	reset: '\x1b[0m',
	dim: '\x1b[2m',
	bright: '\x1b[1m',
	black: '\x1b[30m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	magenta: '\x1b[35m',
	cyan: '\x1b[36m',
	white: '\x1b[37m',
	gray: '\x1b[90m',
	crimson: '\x1b[38m'
};

type Color = keyof typeof colors;

export const logger = {
	debug: (label: string, value: string, color: Color = 'dim') =>
		console.log(
			[
				'  ',
				colors.green,
				'\u279c',
				colors.reset,
				'  ',
				colors.bright,
				label,
				': ',
				colors[color],
				value,
				colors.reset
			].join('')
		)
};
