import { FC, memo } from "react";

interface NetworkIndicatorProps {
	isOnline: Boolean;
}

const NetworkIndicator: FC<NetworkIndicatorProps> = memo(({ isOnline }) => {
	const baseClassName = "networkIndicator";
	const className = isOnline  ? `${baseClassName} ${baseClassName}-online` : `${baseClassName} ${baseClassName}-offline`;

	console.log(`Network Indicator Rendered! ${className}`);

	return(
		<div className={className} />
	)
});

export default NetworkIndicator;