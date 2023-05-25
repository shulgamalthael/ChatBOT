import { useConversationsStore } from "../../../stores/conversations/conversations";

const ChatBotOverlay = () => {
    const isStopped = useConversationsStore((state) => state.botConversationSettings.isStopped);

    if(!isStopped) {
        return null;
    }

    return(
        <div className="flex absolute top-0 left-0 h-full w-full">
            <div style={{ zIndex: 2 }} className="flex m-auto color-primary fw-700 fz-21">Session Stopped!</div>
        </div>
    );
}

export default ChatBotOverlay;