import { FC } from "react";
import "./ToolTip.css";

export interface IToolTipProps {
    text: string;
}

const ToolTip: FC<IToolTipProps> = ({ text }) => {
    return(
        <div className="wl-cb-tooltip">{text}</div>
    )
}

export default ToolTip;
