/* @components */
import CloudNotification from "../cloudNotification/CloudNotification";

/* @stores */
import { useNotificationsStore } from "../../../stores/notifications/notificationsStore";

const CloudNotificationsList = () => {
    const list = useNotificationsStore((state) => state.notificationsCloudState.list);

    // const list = Array(10).fill({
    //     _id: "6474aa351cc86349525b3f64",
    //     title: "guest#9307 await You",
    //     accept: "conversation/staff/accept",
    //     decline: "conversation/staff/decline",
    //     actionType: "conversationStaffAwaition",
    //     staffList: [
    //         "646f659167785dea3af53cb9",
    //         "646f65bf67785dea3af53cf0",
    //         "646f65c867785dea3af53d1c",
    //         "646f65cf67785dea3af53d48"
    //     ],
    //     conversationId: "6470aa4e1dbaae42d6620e18",
    //     isSocketAction: true,
    //     from: "9307966241320590",
    //     to: "646f65cf67785dea3af53d48"
    // });

    return(
        <div style={{ width: "100vw", overflow: "hidden" }}>
            <div style={{ display: "flex" }}>
                {[...list].reverse().map((notification, notificationIndex) => (
                    <CloudNotification key={notification._id} index={notificationIndex} notification={notification} />
                ))}
            </div>
        </div>
    );
}

export default CloudNotificationsList;