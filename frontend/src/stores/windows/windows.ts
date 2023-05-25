import produce from 'immer';
import { create } from 'zustand';

interface MainMenuTabState {
	show: boolean;
	tabName: string;
}

interface MainMenuState {
	show: boolean,
	tabState: MainMenuTabState,
}

interface WindowsStore {
	canShowChatBOTSettings: boolean;
	mainMenuState: MainMenuState;
	hideMainMenu: () => void;
	hideChatBOTSettings: () => void;
	displayChatBOTSettings: () => void;
	toggleMainMenuVisibility: () => void;
	changeMainMenuTabState: (visibilityFlag: boolean, tabName: string) => void;
}

export const useWindows = create<WindowsStore>((set: Function, get: Function): WindowsStore => {
	const toggleMainMenuVisibility = () => {
		set(produce((draft: WindowsStore) => {
			draft.mainMenuState.show = !draft.mainMenuState.show;
		}));
	}

	const hideMainMenu = () => {
		set(produce((draft: WindowsStore) => {
			draft.mainMenuState.show = false;
		}));
	}

	const changeMainMenuTabState = (visibilityFlag: boolean, tabName: string) => {
		set(produce((draft: WindowsStore) => {
			draft.mainMenuState.tabState.tabName = tabName;
			draft.mainMenuState.tabState.show = visibilityFlag;
		}));
	}

	const displayChatBOTSettings = () => {
		set(produce((draft: WindowsStore) => {
			draft.canShowChatBOTSettings = true;
		}));
	}

	const hideChatBOTSettings = () => {
		set(produce((draft: WindowsStore) => {
			draft.canShowChatBOTSettings = false;
		}));
	}

	return {
		mainMenuState: {
			show: false,
			tabState: {
				show: false,
				tabName: 'conversations',
			}
		},
		canShowChatBOTSettings: false,
		hideMainMenu,
		hideChatBOTSettings,
		displayChatBOTSettings,
		changeMainMenuTabState,
		toggleMainMenuVisibility,
	}
});