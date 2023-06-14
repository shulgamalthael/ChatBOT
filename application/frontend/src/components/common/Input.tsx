import { ChangeEvent, FC, MouseEvent, Ref, forwardRef, useCallback, useEffect, useState } from "react";

interface IInputProps {
	id?: string;
	type: string;
	min?: number;
	name?: string;
	inputValue?: any;
	className?: string;
	placeholder?: string;
	onClick?: () => void;
	ref?: Ref<HTMLInputElement>;
	onBlur?: (e: ChangeEvent<HTMLInputElement>) => void;
	onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

const Input: FC<IInputProps> = forwardRef((props, ref) => {
	const { id, name, min, type, placeholder, inputValue, className, onBlur, onClick, onChange } = props;

	const [value, changeValue] = useState("");

	const baseClassName = "option-input flex flex-grow";
	const inputClassName = className ? `${baseClassName} ${className}` : baseClassName;

	const clickCallback = useCallback((e: MouseEvent<HTMLInputElement>) => {
		e?.stopPropagation();
		if(onClick) {
			onClick();
		}
	}, [onClick]);

	const changeValueCallback = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		const value = Array.isArray(e.target.files) && e.target.files.length
			? 	e.target.files[0]
			:	e.target.value
		;

		changeValue(value);

		if(onChange) {
			onChange(e);
		}
	}, [onChange]);

	useEffect(() => {
		changeValue(inputValue);
	}, [inputValue, changeValue]);

	return(
		<input
			id={id}
			min={min}
			ref={ref}
			type={type}
			name={name}
			value={value}
			onBlur={onBlur}
			onClick={clickCallback}
			placeholder={placeholder}
			className={inputClassName}
			onChange={changeValueCallback} 
		/>
	);
});

export default Input;