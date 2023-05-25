import { FC, MouseEvent } from "react";

interface ISaveButtonProps {
	click?: (e: MouseEvent<HTMLElement>) => void;
}

const SaveButton: FC<ISaveButtonProps> = ({ click }) => {
	return(
		<button className="btn save" onClick={click}>Save</button>
	)
}

export default SaveButton;