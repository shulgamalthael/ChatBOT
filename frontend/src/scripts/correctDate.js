const correctNumber = (number) => {
	if(number >= 10) {return number;}

	return `0${number}`
}

export const correctDate = (date, format) => {
	if(format === "DD.MM.YYYY") {
		return `${correctNumber(date.getDay())}.${correctNumber(date.getMonth())}.${correctNumber(date.getFullYear())}`;
	}

	return `${correctNumber(date.getHours())}:${correctNumber(date.getMinutes())}`;
}