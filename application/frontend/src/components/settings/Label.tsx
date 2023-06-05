import { FC, useMemo } from "react";
import { ReactChildren } from "../../interfaces/children";

interface ILabelProps {
	title?: string;
	color?: string;
	skipMarginBottom?: boolean;
	children?: ReactChildren;
}

const Label: FC<ILabelProps> = ({ title, color, skipMarginBottom, children }) => {
	const baseClassName = "label";
	const className = useMemo(() => {
		let _className = skipMarginBottom 
			? baseClassName 
			: `${baseClassName} mb-5`
		;

		switch(color) {
			case "third":
				_className = `${_className} color-third`;
				break;
			case "secondary":
				_className = `${_className} color-secondary`;
				break;
			default:
				_className = `${_className} color-primary`;
				break;
		}

		return _className;
	}, [color, skipMarginBottom]);
	
	return(
		<div className={className}>
			<div>
				{title}
			</div>
			{children}
		</div>
	)
}

export default Label;