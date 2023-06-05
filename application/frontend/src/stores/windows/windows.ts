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
	showMainMenu: () => void;
	hideMainMenu: () => void;
	hideChatBOTSettings: () => void;
	showChatBOTSettings: () => void;
	toggleMainMenuVisibility: () => void;
	changeMainMenuTabState: (visibilityFlag: boolean, tabName: string) => void;
}

export const useWindows = create<WindowsStore>((set: Function, get: Function): WindowsStore => {
	const toggleMainMenuVisibility = () => {
		set(produce((draft: WindowsStore) => {
			draft.mainMenuState.show = !draft.mainMenuState.show;
		}));
	}

	const showMainMenu = () => {
		set(produce((draft: WindowsStore) => {
			draft.mainMenuState.show = true;
		}));
	}

	const hideMainMenu = () => {
		const isShowMainMenu = get().mainMenuState.show;
		if(isShowMainMenu) {
			set(produce((draft: WindowsStore) => {
				draft.mainMenuState.show = false;
			}));
		}
	}

	const changeMainMenuTabState = (visibilityFlag: boolean, tabName: string) => {
		set(produce((draft: WindowsStore) => {
			draft.mainMenuState.tabState.tabName = tabName;
			draft.mainMenuState.tabState.show = visibilityFlag;
		}));
	}

	const showChatBOTSettings = () => {
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
		showMainMenu,
		hideMainMenu,
		hideChatBOTSettings,
		showChatBOTSettings,
		changeMainMenuTabState,
		toggleMainMenuVisibility,
	}
});