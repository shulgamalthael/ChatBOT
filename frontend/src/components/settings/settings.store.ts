import produce from 'immer';
import { create } from "zustand";

interface ISettingsState {
	on: boolean;
	botName: string;
}

interface ISettingsStore {
	settings: ISettingsState;
	changeBOTName: (botName: string) => void;
	toggleEnablationState: (value: boolean) => void;
}

export const useSettingsStore = create<ISettingsStore>((set, get) => {
	const changeBOTName = (botName: string) => {
		set(produce((draft: ISettingsStore) => {
			draft.settings.botName = botName;
		}));
	}

	const toggleEnablationState = (value: boolean) => {
		set(produce((draft: ISettingsStore) => {
			draft.settings.on = value;
		}));
	}

	return {
		settings: {
			on: false,
			botName: "Ahiles",
		},
		changeBOTName,
		toggleEnablationState
	}
});