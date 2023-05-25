/* @stores */
import { useConversationsStore } from "../../../stores/conversations/conversations";

/* @components */
import CloudMessage from "../cloudMessage/CloudMessage";

const CloudMessagesList = () => {
    const list = useConversationsStore((state) => state.messagesCloudState.list);

    return(
        <div style={{ width: "100vw", overflow: "hidden" }}>
            <div style={{ display: "flex" }}>
                {[...list].reverse().map((message, messageIndex) => (
                    <CloudMessage key={message._id} index={messageIndex} message={message} />
                ))}
            </div>
        </div>
    );
}

export default CloudMessagesList;