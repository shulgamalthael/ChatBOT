/* components */
import { FC } from "react";
import NetworkIndicator from "./NetworkIndicator";

interface AvatarProps {
    avatarUrl: string;
    isOnline: boolean;
}

const Avatar: FC<AvatarProps> = ({ avatarUrl, isOnline = true }) => {
	const baseAvatarStyles = { backgroundImage: `url(${avatarUrl})` };

	console.log("Avatar Rendered!");
	
	return(
		<div className="wl-cb-avatar" style={baseAvatarStyles}>
			{!avatarUrl && <i className="chat-icon-user user-icon" />}
			<NetworkIndicator isOnline={isOnline} />
		</div>
	)
}

export default Avatar;
