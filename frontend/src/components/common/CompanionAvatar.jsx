/* components */
import { useConversationsStore } from "../../stores/conversations/conversations";
import { useUserStore } from "../../stores/user/user";
import Avatar from "./Avatar";
import BOTAvatar from "./BOTAvatar";

const CompanionAvatar = () => {
	const userData = useUserStore((state) => state.userData);
	const selectedConversation = useConversationsStore((state) => state.selectedConversation);

	const recipientId = selectedConversation?.recipients?.find((recipient) => recipient !== userData?._id);
	const recipient = selectedConversation?.recipientsDataById?.[recipientId];
	const avatarUrl = recipient?.avatarUrl;

	const isBOT = recipientId === userData?.businessId;

	console.log("Companion Avatar Rendered!");
	
	return isBOT ? <BOTAvatar /> : <Avatar avatarUrl={avatarUrl} isOnline />;
}

export default CompanionAvatar;
