/* react */
import { memo } from "react";
import { useConversationsStore } from "../../../stores/conversations/conversations";

const CompanionName = memo(() => {
	const selectedConversation = useConversationsStore(state => state.selectedConversation);

	if(!selectedConversation) {
		return null;
	}

	console.log("Companion Name Rendered!");

	return(
		<div className="companionName">{selectedConversation.title}</div>
	)
});

export default CompanionName;