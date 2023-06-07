/* @zustand */
import { create } from "zustand";

import { produce } from "immer";
import { MouseEvent } from "react";
import config from "../../api/config";
import { generateId } from "../../scripts/generateId";
import { correctDuplicatedString } from "../../scripts/correctDuplicatedString";
import { deleteAllowPageApi, getAllowPagesApi, getCommandsListApi, getGeneralSettingsApi, saveAllowPagesListApi, saveBOTAvatarApi, saveCommandsListApi, saveGeneralSettingsApi, getLiveAgentSettingsApi, saveLiveAgentSettingsApi } from "../../api/api";

export const defaultBotAvatar = `${config.baseApiUrl}/uploads/avatars/default/assistant.jpg`;

export interface IPage {
	_id: string;
	title: string;
	isChecked: boolean;
}

export interface IAllowPages {
	list: IPage[];
	getPagesList: () => void;
	savePagesList: () => void;
	deletePage: (pageId: string) => void;
	checkPageAccess: (pathname: string) => void;
}

export interface ILiveChatDuration {
	enabled: boolean;
	duration: number;
}

export interface ILiveAgentSettings {
	triggerLink: string;
	responseDuration: number;
	liveChatDuration: ILiveChatDuration;
}

export interface IGeneralSettings {
	enabled: boolean;
	botName: string;
	botAvatar: string | null;
	showingChatTimer: number | null;
	messageSendingTimer: number | null;
}

export interface IMenuOption {
	_id: string;
	link: string;
	title: string;
	actionType: string;
}

export interface ITrigger {
	_id: string;
	title: string;
}

export interface IResponse {
	_id: string;
	title: string;
}

export interface ICommand {
	_id: string;
	title: string;
	type: string;
	triggersList: ITrigger[];
	responsesList: IResponse[];
	menuOptionsList: IMenuOption[];
}

interface ICommandSettings {
	commandsList: ICommand[];
	isCommandsHasGreeting: boolean;
	isCommandsHasRejecting: boolean;
}

interface IBotSettingsState {
	allowPages: IAllowPages;
	isCommandsListFetched: boolean;
	isCommandsListFetching: boolean;
	isGeneralSettingsFetched: boolean;
	isGeneralSettingsFetching: boolean;
	isAllowListFetched: boolean;
	isAllowListFetching: boolean;
	isLiveAgentFetched: boolean;
	isLiveAgentFetching: boolean;
	commandsSettings: ICommandSettings;
	generalSettings: IGeneralSettings;
	liveAgentSettings: ILiveAgentSettings;
	checkCommandsList: () => void;
	addPage: (page: IPage) => void;
	getCommandsList: () => Promise<boolean>;
	changeBotName: (botName: string) => void;
	getGeneralSettings: () => Promise<boolean>;
	saveBOTAvatar: (file: File | null) => void;
	addCommand: (command: ICommand) => boolean;
	removeCommand: (commandIndex: number) => void;
	toggleEnablationState: (value: boolean) => void;
	changeShowingChatTimer: (timer: string) => void;
	changeLiveChatDuration: (value: string) => void;
	changeMessageSendingTimer: (timer: string) => void;
	checkPage: (page: IPage, pageIndex: number) => void;
	saveCommandsList: (e: MouseEvent<HTMLElement>) => void;
	changeLiveAgentTriggerLink: (triggerLink: string) => void;
	saveGeneralSettings: (e: MouseEvent<HTMLElement>) => void;
	updateCommandsListFetchingState: (prop: boolean) => void;
	updateGeneralSettingsFetchingState: (prop: boolean) => void;
	changeResponseDuration: (duration: string) => void;
	updateAllowListFetchingState: (prop: boolean) => void;
	updateLiveAgentSettingsFetchingState: (prop: boolean) => void;
	switchLiveChatDurationEnablationState: (prop: boolean) => void;
	editCommand: (command: ICommand, commandIndex: number) => void;
	removeTrigger: (commandIndex: number, triggerIndex: number) => void;
	removeResponse: (commandIndex: number, responseIndex: number) => void;
	getLiveAgentSettings: () => void;
	saveLiveAgentSettings: () => void;
	checkIsLiveAgentTriggerExistsForCurrentCommand: (commandIndex: number) => boolean;
	removeMenuOptionSettings: (commandIndex: number, menuOptionIndex: number) => void;
	changeMenuOptionActionType: (commandIndex: number, menuOptionIndex: number, actionType: string) => void;
}

export const useBotSettings = create<IBotSettingsState>((set, get): IBotSettingsState => {
	const changeBotName = (botName: string) => {
		set(produce(draft => {
			draft.generalSettings.botName = botName;
		}));
	}

	const saveBOTAvatar = async (file: File | null) => {
		if(file) {
			const generalSettings = JSON.parse(JSON.stringify(get().generalSettings));
			generalSettings.botAvatar = file;
			const formData = new FormData();
			for(let setting in generalSettings) {
				if(setting !== "_id" && setting !== "__v") {
					formData.append(setting, generalSettings[setting]);
				}
			}
			const response = await saveBOTAvatarApi(formData);

			console.log('responseresponseresponseresponseresponseresponseresponseresponseresponseresponseresponseresponseresponseresponseresponseresponseresponse', { response })

			if(response.isFetched && response.data) {
				set({ generalSettings: response.data });
			}
		}
	}

	const checkCommandsList = () => {
		const commandsList = get().commandsSettings.commandsList;
		
		const greetingCommand = commandsList.find((command) => command.type === "greeting");
		const rejectingCommand = commandsList.find((command) => command.type === "rejecting");

		if(greetingCommand) {
			set(produce((draft) => {
				draft.commandsSettings.isCommandsHasGreeting = true;
			}));
		}

		if(!greetingCommand) {
			set(produce((draft) => {
				draft.commandsSettings.isCommandsHasGreeting = false;
			}));
		}

		if(rejectingCommand) {
			set(produce((draft) => {
				draft.commandsSettings.isCommandsHasRejecting = true;
			}));
		}

		if(!rejectingCommand) {
			set(produce((draft) => {
				draft.commandsSettings.isCommandsHasRejecting = false;
			}));
		}
	}

	const toggleEnablationState = (value: boolean) => {
		set(produce(draft => {
			draft.generalSettings.enabled = value;
		}));
	}

	const changeShowingChatTimer = (timer: string) => {
		set(produce(draft => {
			draft.generalSettings.showingChatTimer = parseInt(timer || '0', 10);
		}));
	}

	const changeMessageSendingTimer = (timer: string) => {
		set(produce(draft => {
			draft.generalSettings.messageSendingTimer = parseInt(timer || '0', 10);
		}));
	}

	const addCommand = (command: ICommand) => {
		let isProcessed = false;

		set(produce((draft: IBotSettingsState) => {
			const existsCommand = draft.commandsSettings.commandsList.find((_command, i ,a) => {
				console.log({ _command, command, a });
				return _command.title === command.title;
			});

			const isGreetingCommandExisting = draft.commandsSettings.commandsList.find((_command, i ,a) => {
				return _command.type === "greeting";
			});

			if(!isGreetingCommandExisting) {
				draft.commandsSettings.isCommandsHasGreeting = false;
			}

			if(isGreetingCommandExisting || command.type === "greeting") {
				draft.commandsSettings.isCommandsHasGreeting = true;
			}

			const isRejectingCommandExisting = draft.commandsSettings.commandsList.find((_command, i ,a) => {
				return _command.type === "rejecting";
			});

			if(!isRejectingCommandExisting) {
				draft.commandsSettings.isCommandsHasRejecting = false;
			}

			if(isRejectingCommandExisting || command.type === "rejecting") {
				draft.commandsSettings.isCommandsHasRejecting = true;
			}

			if(existsCommand) {
				return;
			}

			isProcessed = true;
			draft.commandsSettings.commandsList.push(command);
		}));

		return isProcessed;
	}

	const removeCommand = (commandIndex: number) => {
		const commandsList = get().commandsSettings.commandsList;
		if(commandIndex >= 0 && commandsList[commandIndex]) {
			set(produce(draft => {
				draft.commandsSettings.commandsList.splice(commandIndex, 1);
			}));
		}
	}

	const editCommand = (command: ICommand, commandIndex: number) => {
		if(commandIndex >= 0) {
			set(produce((draft: IBotSettingsState) => {
				draft.commandsSettings.commandsList.splice(commandIndex, 1, command);
			}));
		}
	}

	const removeTrigger = (commandIndex: number, triggerIndex: number) => {
		if(commandIndex >= 0 && triggerIndex >= 0) {
			set(produce((draft: IBotSettingsState) => {
				draft.commandsSettings.commandsList[commandIndex].triggersList.splice(triggerIndex, 1);
			}));
		}
	}

	const removeResponse = (commandIndex: number, responseIndex: number) => {
		if(commandIndex >= 0 && responseIndex >= 0) {
			set(produce((draft: IBotSettingsState) => {
				draft.commandsSettings.commandsList[commandIndex].responsesList.splice(responseIndex, 1);
			}));
		}
	}

	const removeMenuOptionSettings = (commandIndex: number, menuOptionIndex: number) => {
		if(commandIndex >= 0 && menuOptionIndex >= 0) {
			set(produce((draft: IBotSettingsState) => {
				draft.commandsSettings.commandsList[commandIndex].menuOptionsList.splice(menuOptionIndex, 1);
			}));
		}
	}

	const saveGeneralSettings = async (e: MouseEvent<HTMLElement>) => {
		e?.stopPropagation();
		const generalSettings = get().generalSettings;

		if(!generalSettings) {
			return null;
		}

		get().updateGeneralSettingsFetchingState(false);

		const generalSettingsData = {
			botName: generalSettings.botName,
			enabled: generalSettings.enabled,
			botAvatar: generalSettings.botAvatar,
			showingChatTimer: generalSettings.showingChatTimer,
			messageSendingTimer: generalSettings.messageSendingTimer,
		}

		const response = await saveGeneralSettingsApi(generalSettingsData);

		if(response.isFetched && response.data) {
			set({ generalSettings: response.data });
		}
		
		get().updateGeneralSettingsFetchingState(true);
		return false;
	}

	const saveCommandsList = async (e: MouseEvent<HTMLElement>) => {
		get().updateCommandsListFetchingState(false);
		e?.stopPropagation();
		const commandsList: ICommand[] = JSON.parse(JSON.stringify(get().commandsSettings.commandsList))
			.map((command: ICommand) => {
				command.triggersList = command.triggersList.filter((response) => response.title);
				command.responsesList = command.responsesList.filter((response) => response.title);
				command.menuOptionsList = command.menuOptionsList.filter((menuOption) => menuOption.title);

				return command;
			})
		;

		const response = await saveCommandsListApi(commandsList);

		if(response.isFetched) {
			get().getCommandsList();
		}

		get().updateCommandsListFetchingState(true);
		return false;
	}

	const getGeneralSettings = async () => {
		get().updateGeneralSettingsFetchingState(false);
		const response = await getGeneralSettingsApi();

		if(response.isFetched && response.data) {
			set(produce((draft: IBotSettingsState) => {
				draft.generalSettings = {
					...response.data,
					botAvatar: response.data.botAvatar || defaultBotAvatar
				};
			}));

			get().updateGeneralSettingsFetchingState(true);
			return true;
		}

		return false;
	}

	const getCommandsList = async () => {
		get().updateCommandsListFetchingState(false);
		const response = await getCommandsListApi();

		if(response.isFetched && Array.isArray(response.data)) {
			set(produce((draft: IBotSettingsState) => {
				draft.commandsSettings.commandsList = response.data || draft.commandsSettings.commandsList;
			}));

			get().updateCommandsListFetchingState(true);
			return true;
		}

		get().updateCommandsListFetchingState(true);
		return false;
	}

	const addPage = (page: IPage) => {
		if(!page) {
			return;
		}

		const pagesList = get().allowPages.list;
		page.title = correctDuplicatedString(page.title, pagesList, 0, "title");

		set(produce((draft) => {
			draft.allowPages.list.push(page);
		}));
	}

	const checkPage = (page: IPage, pageIndex: number) => {
		const pagesList = get().allowPages.list;
		if(Array.isArray(pagesList) && pagesList.length && pageIndex >= 0) {
			set(produce((draft) => {
				draft.allowPages.list.splice(pageIndex, 1, page);
			}));
		}
	}

	const getAllowPagesList = async () => {
		get().updateAllowListFetchingState(false);
		const response = await getAllowPagesApi();

		if(response.isFetched && Array.isArray(response.data)) {
			set(produce((draft) => {
				draft.allowPages.list = response.data;
			}));
		}
		get().updateAllowListFetchingState(true);
	}

	const saveAllowPagesList = async () => {
		get().updateAllowListFetchingState(false);
		const allowPagesList = get().allowPages.list;
		const response = await saveAllowPagesListApi(allowPagesList);

		if(response.isFetched && Array.isArray(response.data)) {
			set(produce((draft) => {
				draft.allowPages.list = response.data;
			}));
			get().updateAllowListFetchingState(true);
			return true;
		}

		get().updateAllowListFetchingState(true);
		return false;
	}

	const deleteAllowPage = async (pageId: string) => {
		const response = await deleteAllowPageApi(pageId);

		get().updateAllowListFetchingState(false);
		if(response.isFetched && Array.isArray(response.data)) {
			set(produce((draft) => {
				draft.allowPages.list = response.data;
			}));
			get().updateAllowListFetchingState(true);

			return true;
		}

		get().updateAllowListFetchingState(true);
		return false;
	}

	const checkPageAccess = (pathname: string) => {
		const allowPagesList = get().allowPages.list;

		const page = allowPagesList.find((page) => {
			if(pathname === "/" && pathname === page.title && page.isChecked) {
				return true;
			}

			if(pathname !== "/" && page.title !== "/" && pathname.includes(page.title) && page.isChecked) {
				return true;
			}

			return false;
		});

		return !!page;
	}

	const getLiveAgentSettings = async () => {
		get().updateLiveAgentSettingsFetchingState(false);
		const response = await getLiveAgentSettingsApi();

		if(response.isFetched && response.data) {
			set({ liveAgentSettings: response.data });
		}

		get().updateLiveAgentSettingsFetchingState(true);
	}

	const saveLiveAgentSettings = async () => {
		const liveAgentSettings = get().liveAgentSettings;
		
		if(!liveAgentSettings) {
			return null;
		}
		
		get().updateLiveAgentSettingsFetchingState(false);
		const response = await saveLiveAgentSettingsApi(liveAgentSettings);

		if(response.isFetched && response.data) {
			set({ liveAgentSettings: response.data });
		}

		get().updateLiveAgentSettingsFetchingState(true);
	}

	const changeLiveAgentTriggerLink = (triggerLink: string): void => {
		set(produce((draft) => {
			draft.liveAgentSettings.triggerLink = triggerLink;
		}));
	}

	const switchLiveChatDurationEnablationState = (prop: boolean): void => {
		set(produce((draft) => {
			draft.liveAgentSettings.liveChatDuration.enabled = prop;
		}));
	}

	const changeLiveChatDuration = (duration: string): void => {
		set(produce((draft) => {
			draft.liveAgentSettings.liveChatDuration.duration = parseInt(duration, 10) || 0;
		}));
	}
	
	const changeResponseDuration = (duration: string): void => {
		set(produce((draft) => {
			draft.liveAgentSettings.responseDuration = parseInt(duration, 10) || 0;
		}));
	}

	const updateGeneralSettingsFetchingState = (prop: boolean): void => {
		set({ 
			isGeneralSettingsFetching: !prop,
			isGeneralSettingsFetched: prop
		});
	};

	const updateCommandsListFetchingState = (prop: boolean): void => {
		set({ 
			isCommandsListFetching: !prop,
			isCommandsListFetched: prop
		});
	};

	const updateAllowListFetchingState = (prop: boolean): void => {
		set({ 
			isAllowListFetching: !prop,
			isAllowListFetched: prop
		});
	}

	const updateLiveAgentSettingsFetchingState = (prop: boolean): void => {
		set({ 
			isLiveAgentFetching: !prop,
			isLiveAgentFetched: prop
		});
	}

	const checkIsLiveAgentTriggerExistsForCurrentCommand = (commandIndex: number): boolean => {
		const commandsList = get().commandsSettings.commandsList;

		if(!commandsList[commandIndex]) {
			return false;
		};

		return !!commandsList[commandIndex].menuOptionsList.find((menuOption) => {
			return menuOption.actionType === "liveAgentTrigger";
		});
	}

	const changeMenuOptionActionType = (commandIndex: number, menuOptionIndex: number, actionType: string): void => {
		const commandsList = get().commandsSettings.commandsList;

		if(!commandsList[commandIndex] || !actionType) {
			return;
		}

		if(!Array.isArray(commandsList[commandIndex].menuOptionsList) || !commandsList[commandIndex].menuOptionsList[menuOptionIndex]) {
			return;	
		}

		set(produce((draft) => {
			draft.commandsSettings.commandsList[commandIndex].menuOptionsList[menuOptionIndex].actionType = actionType;
		}));
	}

	return {
		generalSettings: {
			enabled: false,
			botName: "Ahil",
			botAvatar: null,
			showingChatTimer: 0,
			messageSendingTimer: 0,
		},
		liveAgentSettings: {
			triggerLink: "Talk to a real person",
			responseDuration: 5,
			liveChatDuration: {
				enabled: false,
				duration: 30,
			},
		},
		isCommandsListFetched: false,
		isCommandsListFetching: false,
		isGeneralSettingsFetched: false,
		isGeneralSettingsFetching: false,
		isAllowListFetched: false,
		isAllowListFetching: false,
		isLiveAgentFetched: false,
		isLiveAgentFetching: false,
		allowPages: {
			list: [{
				_id: generateId(),
				isChecked: true,
				title: "/"
			}],
			getPagesList: getAllowPagesList,
			savePagesList: saveAllowPagesList,
			deletePage: deleteAllowPage,
			checkPageAccess: checkPageAccess,
		},
		commandsSettings: {
			commandsList: [],
			isCommandsHasGreeting: false,
			isCommandsHasRejecting: false
		},
		addPage,
		checkPage,
		addCommand,
		editCommand,
		changeBotName,
		removeCommand,
		removeTrigger,
		saveBOTAvatar,
		removeResponse,
		getCommandsList,
		saveCommandsList,
		checkCommandsList,
		getGeneralSettings,
		saveGeneralSettings,
		getLiveAgentSettings,
		saveLiveAgentSettings,
		toggleEnablationState,
		changeLiveChatDuration,
		changeShowingChatTimer,
		changeResponseDuration,
		removeMenuOptionSettings,
		changeMessageSendingTimer,
		changeLiveAgentTriggerLink,
		changeMenuOptionActionType,
		updateAllowListFetchingState,
		updateCommandsListFetchingState,
		updateGeneralSettingsFetchingState,
		updateLiveAgentSettingsFetchingState,
		switchLiveChatDurationEnablationState,
		checkIsLiveAgentTriggerExistsForCurrentCommand,
	}
});
