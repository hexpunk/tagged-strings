export type TaggedTemplateStringFn = (...values: any[]) => string;

/**
 * Turns a template string into a tagged template string. This allows the
 * placeholder values (denoted by `${number | any}`) to be evaluated later
 * via function call.
 *
 * To create the final string, after referencing a tagged template string,
 * call it as a function like so;
 * ```
 * const taggedStr = tagString`${0}: This is the ${0}${'suffix'} template string${1}`;
 * taggedStr(1, '!', { suffix: 'st' }); // 1: This is the 1st template string!
 * taggedStr(2, '?', { suffix: 'nd' }); // 2: This is the 2nd template string?
 * ```
 *
 * Specifying positional placeholders such as `${0}` or `${42}` will use the
 * argument at that position when placing it in the final string.
 *
 * Specifying named placeholders such as `${'foo'}` or `${'bar'}` will
 * attempt to find a key for the placeholder name in the last argument passed
 *  in to the function if it is an object.
 *
 * @param literals The literal parts of the template string being tagged
 * @param placeholders The placeholder arguments of the template string
 * @throws Throws if any of the following are true:
 * * A positional placeholder refers to a parameter position out of bounds
 * * A positional placeholder refers to an object not a literal
 * * A named parameter is specified but the final parameter is not an object
 */
export function tagString(literals: TemplateStringsArray, ...placeholders: any[]): TaggedTemplateStringFn {
	return (...values: any[]) => {
		const dict = values[values.length - 1] || {};
		return placeholders.reduce((acc, curr, i) => {
		let val: any;
		if (Number.isInteger(curr)) {
			if (curr < 0 || curr >= values.length) {
			throw new Error('Positional placeholder out of bounds');
			} else {
			val = values[curr];
			if (typeof val === 'object') {
				throw new Error('Positional placeholder cannot refer to an object');
			}
			}
		} else {
			if (typeof dict !== 'object') {
			throw new Error('Final argument must be an object to use named placeholders');
			}
			val = dict[curr];
		}
		return [ ...acc, val, literals[i + 1] ];
		}, [ literals[0] ]).join('');
	};
}