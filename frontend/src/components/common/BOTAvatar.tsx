/* @components */
import Avatar from "./Avatar";

/* @stores */
import { useBotSettings } from "../../stores/botSettings/botSettingsStore";

const BOTAvatar = () => {
    const botAvatar = useBotSettings((state) => state.generalSettings.botAvatar) || "";

    return(
        <Avatar avatarUrl={botAvatar} isOnline />
    );
}

export default BOTAvatar;