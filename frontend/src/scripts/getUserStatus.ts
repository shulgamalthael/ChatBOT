import { useUserStore } from "../stores/user/user";
import { IConversation } from "../interfaces/conversation.interface";

export const getUserStatus = (conversation: IConversation) => {
    const userData = useUserStore.getState().userData;

    if(!userData || !conversation) {
		return {
            avatarUrl: "",
            isOnline: false,
        };
	}

	let avatarUrl = "";
	let isOnline = false;

	const recipientsDataArrayMap = Object.values(conversation.recipientsDataById);

    console.log('conversation conversation conversation conversation', { conversation, userData });

    if(conversation.isConversationSupportedByStaff) {
        const staffData = Object.values(conversation.recipientsDataById).find((recipient) => recipient.role === "staff");

        if(staffData) {
            isOnline = staffData.isOnline;
            avatarUrl = staffData.avatarUrl;
        }
    }

	if(!conversation.isConversationSupportedByStaff && conversation.isConversationWithAssistant) {
		isOnline = conversation.recipientsDataById[userData.businessId].isOnline;
		avatarUrl = conversation.recipientsDataById[userData.businessId].avatarUrl || "";
	}

	if(!conversation.isConversationSupportedByStaff && !conversation.isConversationWithAssistant && recipientsDataArrayMap.length === 1 && conversation.recipientsDataById[userData._id]) {
		isOnline = userData.isOnline;
		avatarUrl = userData.avatarUrl || "";
	}

	if(!conversation.isConversationSupportedByStaff && !conversation.isConversationWithAssistant && recipientsDataArrayMap.length === 1 && !!conversation.recipients.filter((recipient) => recipient !== userData._id).length) {
		isOnline = false;
		avatarUrl = "";
	}

	if(!conversation.isConversationSupportedByStaff && !conversation.isConversationWithAssistant && conversation.recipients.length > 1 && recipientsDataArrayMap.length > 1) {
		const recipientId = conversation.recipients.find((recipient) => recipient !== userData._id && conversation.recipientsDataById[recipient]) || userData._id;

		isOnline = conversation.recipientsDataById[recipientId].isOnline;
		avatarUrl = conversation.recipientsDataById[recipientId].avatarUrl || "";
	}

    return {
        isOnline,
        avatarUrl,
    }
}