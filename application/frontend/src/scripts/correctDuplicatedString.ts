import { IGenericObjectType } from "../interfaces/genericObjectType";

export const correctDuplicatedString = (query: string, arr: IGenericObjectType[], count = 0, key = ''): string => {
	if(count >= arr.length) {
		return query;
	}
	
	const existingTitle = arr.find((option) => {
		if(key) {
			return option?.[key] === query;
		}

		if(typeof option === "string") {
			return option === query;
		}

		return query;
	});

	if(existingTitle) {
		return correctDuplicatedString(`${query}(1)`, arr, count + 1, key);
	}

	return query;
}