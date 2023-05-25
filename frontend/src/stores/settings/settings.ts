/* @zustand */
import produce from "immer";

/* @zustand */
import { create } from "zustand";
import { audio } from "../../scripts/audio";

export const settingsLocalStorageKeys = {
	VOLUME: "wl-cb-volume"
}

export const audioList = {
	UI: "opening.mp3",
	NOTIFICATION: "notification.mp3",
	OPENING: "showingNotification.mp3",
}

export const useSettingsStore = create((set, get: () => {[key: string]: any}) => {
	const deployApplication = () => {
		set({ isDeployed: true });
	}

	const collapseApplication = () => {
		set({ isDeployed: false });
	}

	const toggleChatDisplayState = () => {
		set({ isChatOpened: !get().isChatOpened });
	}

	const openChat = () => {
		const isOpenned = get().isChatOpened;
		if(!isOpenned) {
			set({ isChatOpened: true });
		}
	}

	const changeVolume = (volume: number) => {
		set({ volume });
		localStorage.setItem(settingsLocalStorageKeys.VOLUME, JSON.stringify(volume));
	}

	const toggleVolume = () => {
		set(produce(draft => {
			draft.volume = draft.volume > 0 ? 0 : 0.5;
			localStorage.setItem(settingsLocalStorageKeys.VOLUME, JSON.stringify(draft.volume));
		}));
	}

	const playAudio = (trackTitle: string): void => {
		const volume = get().volume;
		const track = audio(trackTitle);
		track.volume = volume;
		track.play();
	}

	const soundUIClick = () => {
		playAudio(audioList.UI);
	}

	const updateAuthorizingState = (value: boolean) => {
		set({ isAuthorized: value });
	}

	let volume = Number(JSON.parse(localStorage.getItem(settingsLocalStorageKeys.VOLUME) || "null"));
	volume = volume >= 0 ? volume : 0.5;

	return {
		volume,
		isDeployed: false,
		isChatOpened: false,
		isAuthorized: false,
		openChat,
		playAudio,
		toggleVolume,
		changeVolume,
		soundUIClick,
		deployApplication,
		collapseApplication,
		updateAuthorizingState,
		toggleChatDisplayState,
	}
});