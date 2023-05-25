export const generateId = () => {
	const template = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-_";
	const rn = (min: number, max: number) => Math.floor(Math.random() * (max - min) + min);
	const array = Array(rn(4, 8)).fill(null).map(() => template[rn(0, template.length)]);
	return array.join("");
};
