const utils = {
	trimRightSlash(rawString: string): string {
		return rawString.replace(/\/+$/, "");
	},

	dehumanize(humanizedTitle: string): string {
		return humanizedTitle
			.toLowerCase()
			.replaceAll(/: ?/g, " ")
			.replaceAll(" ", "-");
	},

	// combineArray
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	zipDictionary(keys: string[], values: any[]): { [key: string]: any } {
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		return keys.reduce((obj: { [key: string]: any }, key, index) => {
			obj[key] = values[index];
			return obj;
		}, {});
	},
};

export default utils;
