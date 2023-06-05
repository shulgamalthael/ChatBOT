/* components */
import Avatar from "./Avatar";

/* @scripts */
import { getUserStatus } from "../../scripts/getUserStatus";

/* @stores */
import { useConversationsStore } from "../../stores/conversations/conversations";

const CompanionAvatar = () => {
	const selectedConversation = useConversationsStore((state) => state.selectedConversation);

	if(!selectedConversation) {
		return null;
	}

	const { avatarUrl, isOnline } = getUserStatus(selectedConversation);

	console.log("Companion Avatar Rendered!");
	
	return <Avatar avatarUrl={avatarUrl} isOnline={isOnline} />;
}

export default CompanionAvatar;
