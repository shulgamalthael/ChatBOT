import { FC, MouseEvent, useCallback } from "react";
import { ReactChildren } from "../../interfaces/children";

interface ICancelButtonProps {
	click?: (e: MouseEvent<HTMLElement>) => void;
	children?: ReactChildren;
	className?: string;
	disabled?: boolean;
	skipMarginBottom?: boolean;
}

const CancelButton: FC<ICancelButtonProps> = ({ click, skipMarginBottom, className, disabled, children }) => {
	const baseClassName = "btn cancel";
	let _className = skipMarginBottom
		? `${baseClassName} mb-0` 
		: `${baseClassName} mb-5`
	;

	_className = className ? `${_className} ${className}` : _className;

	const clickCallback = useCallback((e: MouseEvent<HTMLDivElement>) => {
		if(!disabled && click) {
			click(e);
		}
	}, [click]);

	return(
		<div className={_className} onClick={clickCallback}>{children || "Cancel"}</div>
	);
}

export default CancelButton;
