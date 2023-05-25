import { FC, MouseEvent } from "react";
import { ReactChildren } from "../../interfaces/children";

interface ICancelButtonProps {
	click?: (e: MouseEvent<HTMLElement>) => void;
	children?: ReactChildren;
	skipMarginBottom?: boolean;
}

const CancelButton: FC<ICancelButtonProps> = ({ click, skipMarginBottom, children }) => {
	const baseClassName = "btn cancel";
	const className = skipMarginBottom
		? `${baseClassName} mb-0` 
		: `${baseClassName} mb-5`
	;

	return(
		<div className={className} onClick={click}>{children || "Cancel"}</div>
	);
}

export default CancelButton;
