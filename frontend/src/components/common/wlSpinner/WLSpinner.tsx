import { FC } from "react";
import "./WLSpinner.css";

interface WLSpinnerProps {
	className?: string;
}

const WLSpinner: FC<WLSpinnerProps> = ({ className }) => {
	const baseClassName = "css-advance-load";

	const _className = className ? `${baseClassName} ${className}` : baseClassName;

	return(
		<div className={_className}>
			<div className="circle-1 load-item"/>
			<div className="circle-2 load-item"/>
			<div className="circle-3 load-item"/>
			<div className="circle-4 load-item"/>
			<div className="circle-5 load-item"/>
			<div className="circle-6 load-item"/>
			<div className="circle-7 load-item"/>
			<div className="circle-8 load-item"/>
			<div className="circle-9 load-item"/>
			<div className="circle-10 load-item"/>
			<div className="circle-11 load-item"/>
			<div className="circle-12 load-item"/>
		</div>
	)
}

export default WLSpinner;