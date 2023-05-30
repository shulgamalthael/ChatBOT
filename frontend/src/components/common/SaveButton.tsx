import { FC, MouseEvent } from "react";
import { ReactChildren } from "../../interfaces/children";
import WLSpinner from "./wlSpinner/WLSpinner";

interface ISaveButtonProps {
	className?: string;
	isLoading?: boolean;
	children?: ReactChildren;
	click?: (e: MouseEvent<HTMLElement>) => void;
}

const SaveButton: FC<ISaveButtonProps> = ({ className, isLoading, children, click }) => {
	const baseClassName = "btn save";
	let _className = className ? `${baseClassName} ${className}`: baseClassName;

	return(
		<button className={_className} onClick={click}>
			<div>{children || "Save"}</div>
			{isLoading && <WLSpinner className="scale-50" />}
		</button>
	)
}

export default SaveButton;