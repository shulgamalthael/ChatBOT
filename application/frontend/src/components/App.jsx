/* @react */
import React from "react";

/* @stores */
import { useSettingsStore } from "../stores/settings/settings";

/* @components */
import Farm from "./Farm";
import Chat from "./chat/Chat";
import Switcher from "./switcher/Switcher";
import Settings from "./settings/Settings";
import CloudList from "./common/cloudList/CloudList";
import { useBotSettings } from "../stores/botSettings/botSettingsStore";

const ChatApplication = () => {
	const isDeployed = useSettingsStore((state) => state.isDeployed);
	const isPageAccessed = useBotSettings((state) => state.isPageAccessed);

	if(!isDeployed || !isPageAccessed) {
		return null;
	}

	return(
		<React.Fragment>
			<Chat />
			<Switcher />
		</React.Fragment>
	)
}

const App = () => {
	console.log("App Rendered!");

  	return (
		<React.Fragment>
			<Farm />
			<Settings />
			<CloudList />
			<ChatApplication />
		</React.Fragment>
  	);
};

export default App;
