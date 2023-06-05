import { FC, MouseEvent } from "react";
import { ReactChildren } from "../../interfaces/children";

interface ICancelButtonProps {
	click?: (e: MouseEvent<HTMLElement>) => void;
	children?: ReactChildren;
	className?: string;
	skipMarginBottom?: boolean;
}

const CancelButton: FC<ICancelButtonProps> = ({ click, skipMarginBottom, className, children }) => {
	const baseClassName = "btn cancel";
	let _className = skipMarginBottom
		? `${baseClassName} mb-0` 
		: `${baseClassName} mb-5`
	;

	_className = className ? `${_className} ${className}` : _className;

	return(
		<div className={_className} onClick={click}>{children || "Cancel"}</div>
	);
}

export default CancelButton;
