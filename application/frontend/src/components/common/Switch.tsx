import { FC, MouseEvent, useCallback } from "react";

interface ISwitchProps {
	value: boolean;
	onIndicator: string;
	offIndicator: string;
	onChange: (value: boolean) => void;
}

const Switch: FC<ISwitchProps> = ({ value, onIndicator = "ON", offIndicator = "OFF", onChange }) => {
	const baseTrackClassName = "chat-switch-track";
	const trackClassName = value 
		? `${baseTrackClassName} chat-switch-track-on`
		: `${baseTrackClassName} chat-switch-track-off`
	;

	const onChangeCallback = useCallback((e?: MouseEvent<HTMLDivElement>) => {
		e?.preventDefault();
		e?.stopPropagation();

		onChange(!value);
	}, [value, onChange]);

	const stateIndicatorValuePositioner = value 
		? 	{ transform: "translate(calc(0% + 5px), 50%)" } 
		: 	{ transform: "translate(calc(100% - 5px), 50%)" }
	;

	return(
		<div onClick={onChangeCallback} className="chat-switch-thumb overflow-hidden">
			<div className="chat-switch-stateIndicator">
				<div className="chat-switch-stateIndicator-value overflow-hidden text-ellipsis h-fit-content" style={stateIndicatorValuePositioner}>
				{value ? onIndicator : offIndicator}</div>
			</div>
			<div className={trackClassName}></div>
		</div>
	);
}

export default Switch;
