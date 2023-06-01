import React, { ChangeEvent, FC, useCallback, useEffect, useRef, useState } from "react";
import Label from "./Label";
import SaveButton from "../common/SaveButton";
import CancelButton from "../common/CancelButton";
import CommandsListField from "./CommandsListField";

import { useWindows } from "../../stores/windows/windows";

import "./settings.css";
import Section from "./Section";
import Input from "../common/Input";
import { IPage, useBotSettings } from "../../stores/botSettings/botSettingsStore";
import WLSpinner from "../common/wlSpinner/WLSpinner";
import ToolTip, { IToolTipProps } from "../common/toolTip/ToolTip";
import { generateId } from "../../scripts/generateId";

interface ISwitchProps {
	value: boolean;
	onChange: (value: boolean) => void;
}

const Switch: FC<ISwitchProps> = ({ value, onChange }) => {
	const baseTrackClassName = "chat-switch-track";
	const trackClassName = value 
		? `${baseTrackClassName} chat-switch-track-on` 
		: `${baseTrackClassName} chat-switch-track-off`
	;

	const onChangeCallback = useCallback(() => {
		onChange(!value);
	}, [value, onChange]);

	const stateIndicatorValueMargin = value ? "auto 10px" : "auto calc(100% - 25px)";

	return(
		<div onClick={onChangeCallback} className="chat-switch-thumb">
			<div className="chat-switch-stateIndicator">
				<div className="chat-switch-stateIndicator-value" style={{ margin: stateIndicatorValueMargin }}>{value ? "ON" : "OFF"}</div>
			</div>
			<div className={trackClassName}></div>
		</div>
	);
}

const EnablationSwitcher = () => {
	const isEnabled = useBotSettings(state => state.generalSettings.enabled);
	const toggleEnablationState = useBotSettings(state => state.toggleEnablationState);

	return(
		<Switch
			value={isEnabled} 
			onChange={toggleEnablationState} 
		/>
	);
}

const fileReader = (file: File): Promise<string | null> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = () => {
			resolve(typeof reader.result === "string" ? reader.result : null);
		};

		if(file) {
			reader.readAsDataURL(file);
		}

		if(!file) {
			resolve(null);
		}
	});
}

interface IUploaderProps {
	save: (file: File | null) => void;
	close: () => void;
}

const Uploader: FC<IUploaderProps> = ({ close, save }) => {
	const [file, setFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<string | null>(null);

	const deleteFile = useCallback(() => {
		setPreview(null);
		setFile(null);
	}, [setFile, setPreview]);

	const uploadFile = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
		if(e.target.files && e.target.files.length) {
			setFile(e.target.files[0]);
			setPreview(await fileReader(e.target.files[0]));
		}
	}, [setFile]);

	const saveCallback = useCallback(() => {
		save(file);
	}, [file, save]);

	return(
		<div className="flex flex-col fixed top-half left-half p-15 br-5 translate-center bg-secondary border-primary max-h-400 max-w-400">
			<i
				onClick={close}
				className="chat-icon-close fixed top-0 right-0 p-5 fs-10 h-opacity-075 cursor-pointer"
			/>
			<label className="overflow-auto">
				{!preview && <input
					type="file"
					className="d-none"
					onChange={uploadFile}
				/>}
				{preview && <img src={preview} className="h-full w-full" alt="uploader preview" />}
				{!preview && <div className="flex flex-center h-opacity-075 cursor-pointer border-primary br-5 p-5">
					Upload File
				</div>}
			</label>
			{preview &&
				<React.Fragment>
					<div 
						onClick={deleteFile}
						className="flex flex-center h-opacity-075 cursor-pointer border-primary br-5 p-5 mv-5"
					>Delete</div>
					<div 
						onClick={saveCallback}
						className="flex flex-center h-opacity-075 cursor-pointer border-primary br-5 p-5"
					>Save</div>
				</React.Fragment>
			}
		</div>
	)
}

const BotAvatar = () => {
	const botAvatar = useBotSettings((state) => state.generalSettings?.botAvatar || "");
	const styles = { backgroundImage: `url(${botAvatar})` };

	if(!botAvatar) {
		return null;
	}

	return(
		<div className="settings-botAvatar brepeat-no bs-cover bp-center" style={styles}></div>
	)
}

const BotAvatarField = () => {
	const [canShowUploader, showUploader] = useState(false);
	
	const saveBOTAvatar = useBotSettings(state => state.saveBOTAvatar);

	const showUploaderCallback  = useCallback(() => {
		showUploader(true);
	}, [showUploader]);

	const saveAvatar = useCallback((file: File | null) => {
		saveBOTAvatar(file);
	}, [saveBOTAvatar]);

	const closeUploader = useCallback(() => {
		showUploader(false);
	}, [showUploader]);

	return(
		<React.Fragment>
			<BotAvatar />
			<Input
				type="button" 
				inputValue="Upload Avatar"
				onClick={showUploaderCallback}
				className="flex flex-center h-opacity-075 cursor-pointer" 
			/>
			{canShowUploader && <Uploader close={closeUploader} save={saveAvatar} />}
		</React.Fragment>
	);
}

const BotNameField = () => {
	const botName = useBotSettings(state => state.generalSettings.botName);
	const changeBotName = useBotSettings(state => state.changeBotName);

	const changeBotNameCallback = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		changeBotName(e.target.value);
	}, [changeBotName]);

	return(
		<Input
			type="text"
			inputValue={botName}
			placeholder="BOT Name"
			className="option-input w-100"
			onChange={changeBotNameCallback}
		/>
	)
}

const ChatTimerInput = () => {
	const messageSendingTimer = useBotSettings(state => state.generalSettings.messageSendingTimer);
	const changeMessageSendingTimer = useBotSettings(state => state.changeMessageSendingTimer);

	const changeMessageSendingTimerCallback = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		changeMessageSendingTimer(e.target.value || "0");
	}, [changeMessageSendingTimer]);

	return(
		<Input 
			min={0}
			type="number"
			inputValue={messageSendingTimer}
			onChange={changeMessageSendingTimerCallback} 
		/>
	)
}

const ChatShowingInput = () => {
	const showingChatTimer = useBotSettings(state => state.generalSettings.showingChatTimer);
	const changeShowingChatTimer = useBotSettings(state => state.changeShowingChatTimer);

	const changeShowingChatTimerCallback = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		changeShowingChatTimer(e.target.value || "0");
	}, [changeShowingChatTimer]);

	return(
		<Input 
			min={0}
			type="number"
			inputValue={showingChatTimer}
			onChange={changeShowingChatTimerCallback}
		/>
	);
}

interface ICustomCheckboxProps {
	isChecked: boolean;
	onCheck: () => void;
}

const CustomCheckbox: FC<ICustomCheckboxProps> = ({ isChecked, onCheck }) => {
	return(
		<div onClick={onCheck} className="wlcb-checkbox">
			{isChecked && <div className="wlcb-checkbox-hitmark"></div>}
		</div>
	)
}

interface IPageProps {
	page: IPage;
	pageIndex: number;
}

const Page: FC<IPageProps> = ({ page, pageIndex }) => {
	const checkPage = useBotSettings((state) => state.checkPage);
	const deletePage = useBotSettings((state) => state.allowPages.deletePage);

	const onCheckCallback = useCallback(() => {
		const newPage = JSON.parse(JSON.stringify(page));
		newPage.isChecked = !newPage.isChecked;
		checkPage(newPage, pageIndex);
	}, [page, pageIndex, checkPage]);

	const deletePageCallback = useCallback(() => {
		deletePage(page._id);
	}, [deletePage]);

	return(
		<div className="relative flex w-full flex-btw border-primary bg-secondary br-5 p-5 mb-5">
			<div className="flex">
				<CustomCheckbox isChecked={page.isChecked} onCheck={onCheckCallback} />
				<div className="mg-5">{page.title}</div>
			</div>
			<i 
				onClick={deletePageCallback}
				className="chat-icon-remove chat-icon color-remove mv-auto" 
			/>
		</div>
	);
}

const PagesList = () => {
	const [canShowPagesList, showPagesList] = useState(false);
	const pages = useBotSettings((state) => state.allowPages.list);

	const showPagesListCallback = useCallback(() => {
		showPagesList(true);
	}, [showPagesList]);

	const hidePagesListCallback = useCallback(() => {
		showPagesList(false);
	}, [showPagesList]);

	if(!canShowPagesList) {
		return <CancelButton click={showPagesListCallback}>Show Pages List</CancelButton>
	}

	if(!pages.length) {
		return <div className="color-primary">List is empty!</div>;
	}

	return(
		<div>
			{pages.map((page, pageIndex) => (
				<Page key={page._id} page={page} pageIndex={pageIndex} />
			))}
			<CancelButton click={hidePagesListCallback}>Hide Pages List</CancelButton>
		</div>
	)
}

const AlarmToolTip: FC<IToolTipProps> = (props) => {
	return(
		<ToolTip {...props} />
	)
}

const PageBuilder = () => {
	const [toolTipText, setToolTipText] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);
	const addPage = useBotSettings((state) => state.addPage);
	const [canShowPageBuilder, showPageBuilder] = useState(false);

	const showPageBuilderCallback = useCallback(() => {
		showPageBuilder(true);
	}, []);

	const hidePageBuilderCallback = useCallback(() => {
		showPageBuilder(false);
	}, []);

	const save = useCallback(() => {
		if(inputRef.current) {
			const isValid = /^\/(\w*[\/]*\w*$)/i.test(inputRef.current.value);
			if(!isValid) {
				setToolTipText("Page must be an url friendly string");
			}

			if(isValid) {
				setToolTipText("");
				const page: IPage = { _id: generateId(), title: inputRef.current.value, isChecked: false };
				addPage(page);
				hidePageBuilderCallback();
			}
		}
	}, [inputRef]);

	if(!canShowPageBuilder) {
		return <CancelButton click={showPageBuilderCallback}>Add Page</CancelButton>;
	}

	return(
		<React.Fragment>
			<Label title="Page Title">
				<div style={{ position: "relative" }}>
					<Input type="text" ref={inputRef} />
					{toolTipText && <AlarmToolTip text={toolTipText} />}
				</div>
			</Label>
			<div className="flex flex-btw w-full">
				<SaveButton click={save} />
				<CancelButton skipMarginBottom click={hidePageBuilderCallback} />
			</div>
		</React.Fragment>
	);
}

const PagesControlBlock = () => {
	return(
		<div>
			<ul>
				<PagesList />
				<PageBuilder />
			</ul>
		</div>
	);
}

const GeneralSettings = () => {
	const saveGeneralSettings = useBotSettings(state => state.saveGeneralSettings);
	const isGeneralSettingsFetched = useBotSettings(state => state.isGeneralSettingsFetched);

	if(!isGeneralSettingsFetched) {
		return(
			<Section title="General Settings">
				<WLSpinner />
			</Section>
		);
	};

	return(
		<React.Fragment>
			<Section title="General Settings" save={saveGeneralSettings}>
				<div className="w-200">
					<Label title="Power State">
						<EnablationSwitcher />
					</Label>
					<Label title="BOT Name">
						<BotNameField />
					</Label>
					<Label title="BOT Avatar">
						<BotAvatarField />
					</Label>
					<Label title="Message sending Timer">
						<ChatTimerInput />
					</Label>
					<Label title="Showing chat Timer">
						<ChatShowingInput />
					</Label>
				</div>
			</Section>
		</React.Fragment>
	)
}

const AllowPages = () => {
	const saveAllowPagesList = useBotSettings((state) => state.allowPages.savePagesList);
	const isAllowListFetched = useBotSettings(state => state.isAllowListFetched);

	if(!isAllowListFetched) {
		return(
			<Section title="Allow Pages">
				<WLSpinner />
			</Section>
		);
	};

	return(
		<React.Fragment>
			<Section title="Allow Pages" save={saveAllowPagesList}>
				<Label title="Pages where chat will shown">
					<div className="w-200">
						<PagesControlBlock />
					</div>
				</Label>
			</Section>
		</React.Fragment>
	)
}

const CommandsList = () => {
	const saveCommandsList = useBotSettings((state) => state.saveCommandsList);
	const isCommandsListFetched = useBotSettings((state) => state.isCommandsListFetched);

	if(!isCommandsListFetched) {
		return(
			<Section title="Commands List Label">
				<WLSpinner />
			</Section>
		)
	}

	return(
		<React.Fragment>
			<Section title="Commands List Label" save={saveCommandsList}>
				<Label title="Commands List">
					<CommandsListField />
				</Label>
			</Section>
		</React.Fragment>
	)
} 

const LiveChatDurationBlock = () => {
	const enabled = useBotSettings((state) => state.liveAgentSettings.liveChatDuration.enabled);
	const duration = useBotSettings((state) => state.liveAgentSettings.liveChatDuration.duration);
	const changeLiveChatDuration = useBotSettings((state) => state.changeLiveChatDuration);
	const switchLiveChatDurationEnablationState = useBotSettings((state) => state.switchLiveChatDurationEnablationState);

	const changeLiveChatDurationCallback = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		changeLiveChatDuration(e.target.value);
	}, [changeLiveChatDuration]);

	const switchLiveChatDurationEnablationStateCallback = useCallback((prop: boolean) => {
		switchLiveChatDurationEnablationState(prop);
	}, [switchLiveChatDurationEnablationState]);

	return(
		<Label title="Live Chat Duration">
			<Label title="ON/OFF Live Chat Duration">
				<div className="w-200">
					<Switch value={enabled} onChange={switchLiveChatDurationEnablationStateCallback} />
				</div>
			</Label>
			{enabled && (
				<Label title="Live Chat Duration (mins)">
					<div className="w-200">
						<Input type="number" inputValue={duration} onChange={changeLiveChatDurationCallback} />
					</div>
				</Label>
			)}
		</Label>
	)
}

const TriggerLinkField = () => {
	const triggerLink = useBotSettings((state) => state.liveAgentSettings.triggerLink);
	const changeTriggerLink = useBotSettings((state) => state.changeLiveAgentTriggerLink);

	const changeTriggerLinkCallback = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		changeTriggerLink(e.target.value);
	}, [changeTriggerLink]);

	return(
		<Label title="Trigger link">
			<Input 
				type="text" 
				inputValue={triggerLink} 
				onChange={changeTriggerLinkCallback} 
			/>
		</Label>
	)
}

const RespondsWithinDuration = () => {
	const duration = useBotSettings((state) => state.liveAgentSettings.responseDuration);
	const changeResponseDuration = useBotSettings((state) => state.changeResponseDuration);

	const changeResponseDurationCallback = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		changeResponseDuration(e.target.value);
	}, [changeResponseDuration]);

	return(
		<Label title="Responds Within Duration (mins)">
			<div className="w-200">
				<Input type="number" inputValue={duration} onChange={changeResponseDurationCallback} />
			</div>
		</Label>
	);
};

const LiveAgentBlock = () => {
	const isLiveAgentFetched = useBotSettings((state) => state.isLiveAgentFetched);
	const saveLiveAgentSettings = useBotSettings((state) => state.saveLiveAgentSettings);

	if(!isLiveAgentFetched) {
		return(
			<Section title="Live Agent">
				<WLSpinner />
			</Section>
		);
	};

	return(
		<Section title="Live Agent" save={saveLiveAgentSettings}>
			<div className="w-200">
				{/* <TriggerLinkField /> */}
				<LiveChatDurationBlock />
				<RespondsWithinDuration />
			</div>
		</Section>
	)
}

const SettingsButton = () => {
	const showChatBOTSettings = useWindows((state) => state.showChatBOTSettings);
	const isEnabled = useBotSettings((state) => state.generalSettings.enabled);

	if(isEnabled) {
		return null;
	}

	return (
		<div className="settings-showBtn" onClick={showChatBOTSettings}>
			<div>+</div>
		</div>
	)
}

const Settings = () => {
	const hideChatBOTSettings = useWindows((state) => state.hideChatBOTSettings);
	const canShowChatBOTSettings = useWindows((state) => state.canShowChatBOTSettings);

	console.log("Settings Rendered!");

	if(!canShowChatBOTSettings) {
		return <SettingsButton />;
	}

	return(
		<div className="settings">
			<div className="settings-inside">
				<i 
					className="chat-icon-close absolute top-0 right-0 p-15 fs-10 color-primary h-opacity-075 cursor-pointer"
					onClick={hideChatBOTSettings} 
				/>
				<GeneralSettings />
				<AllowPages />
				<CommandsList />
				<LiveAgentBlock />
			</div>
		</div>
	);
}

export default Settings;
