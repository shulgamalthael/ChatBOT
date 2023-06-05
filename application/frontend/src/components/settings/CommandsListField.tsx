import React, { ChangeEvent, Dispatch, FC, MouseEvent, SetStateAction, memo, useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import Label from "./Label";
import Input from "../common/Input";
import CancelButton from "../common/CancelButton";
import { correctDuplicatedString } from "../../scripts/correctDuplicatedString";
import { ICommand, IMenuOption, IResponse, ITrigger, useBotSettings } from "../../stores/botSettings/botSettingsStore";
import { generateId } from "../../scripts/generateId";
import { ReactChildren } from "../../interfaces/children";

interface ITriggerProps {
	trigger: ITrigger;
	triggerIndex: number;
	removeTrigger: (triggerIndex: number) => void;
	editTrigger: (trigger: string, triggerIndex: number) => void;
}

const Trigger: FC<ITriggerProps> = ({ trigger, triggerIndex, editTrigger, removeTrigger }) => {
	const triggerRef = useRef<HTMLDivElement>(null);
	const removeIconRef = useRef<HTMLDivElement>(null);

	const editTriggerCallback = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		e?.stopPropagation();
		editTrigger(e.target.value, triggerIndex);
	}, [triggerIndex, editTrigger]);

	const showRemoveIcon = useCallback(() => {
		if(removeIconRef.current) {
			removeIconRef.current.classList.remove("chat-icon-hide");
			removeIconRef.current.classList.add("chat-icon-show");
		}
	}, [removeIconRef]);

	const hideRemoveIcon = useCallback(() => {
		if(removeIconRef.current) {
			removeIconRef.current.classList.remove("chat-icon-show");
			removeIconRef.current.classList.add("chat-icon-hide");
		}
	}, [removeIconRef]);

	const removeTriggerCallback = useCallback((e: MouseEvent<HTMLElement>) => {
		e?.stopPropagation();
		removeTrigger(triggerIndex);
	}, [triggerIndex, removeTrigger]);

	useLayoutEffect(() => {
		const triggerElement = triggerRef.current;

		if(triggerElement) {
			triggerElement.addEventListener("mouseenter", showRemoveIcon);
			triggerElement.addEventListener("mouseleave", hideRemoveIcon);
		}

		return () => {
			if(triggerElement) {
				triggerElement.removeEventListener("mouseenter", showRemoveIcon);
				triggerElement.removeEventListener("mouseleave", hideRemoveIcon);
			}
		}
	}, [triggerRef, showRemoveIcon, hideRemoveIcon]);

	return(
		<Label color="secondary">
			<div ref={triggerRef} className="flex">
				<Input 
					type="text"
					inputValue={trigger.title}
					onBlur={editTriggerCallback}
				/>
				<i 
					ref={removeIconRef}
					onClick={removeTriggerCallback}
					className="chat-icon-remove chat-icon chat-icon-hide color-remove mv-auto mg-5" 
				/>
			</div>
		</Label>
	)
}

interface ITriggersBlockProps {
	commandIndex: number;
	triggersList: ITrigger[];
	changeTriggerList: Dispatch<SetStateAction<ITrigger[]>>;
}

const TriggersBlock: FC<ITriggersBlockProps> = ({ triggersList, commandIndex, changeTriggerList }) => {
	const [canShowTriggerBuilder, showTriggerBuilder] = useState(false);

	const show = useCallback((e: MouseEvent<HTMLElement>) => {
		e?.stopPropagation();
		showTriggerBuilder(true)
	}, [showTriggerBuilder]);
	
	const close = useCallback((e: MouseEvent<HTMLElement>) => {
		e?.stopPropagation();
		showTriggerBuilder(false)
	}, [showTriggerBuilder]);

	const addTrigger = useCallback((e: MouseEvent<HTMLElement>) => {
		e?.stopPropagation();
		changeTriggerList(prev => {
			return JSON.parse(JSON.stringify([...prev, { _id: generateId(), title: '' }]));
		});
	}, [changeTriggerList]);

	const editTrigger = useCallback((triggerTitle: string, triggerIndex: number) => {
		if(!triggerTitle) {
			return;
		}

		if(triggerIndex >= 0) {
			changeTriggerList(prev => {
				const filteredPrev = JSON.parse(JSON.stringify(prev));
				filteredPrev.splice(triggerIndex, 1);
				const title = correctDuplicatedString(triggerTitle, filteredPrev, 0, 'title');

				prev.splice(triggerIndex, 1, {...prev[triggerIndex], title});

				return JSON.parse(JSON.stringify(prev));
			});
		}
	}, [changeTriggerList]);

	const removeTrigger = useCallback((triggerIndex: number) => {
		changeTriggerList(prev => {
			if(triggerIndex >= 0) {
				prev.splice(triggerIndex, 1);
				return JSON.parse(JSON.stringify(prev));
			}

			return prev;
		});
	}, [changeTriggerList]);

	const isListPresence = Array.isArray(triggersList) && !!triggersList.length;

	return(
		<div className="option">
			<Label skipMarginBottom color="secondary">
				{canShowTriggerBuilder && isListPresence && triggersList.map((trigger, triggerIndex) => (
					<Trigger
						key={trigger._id}
						trigger={trigger}
						editTrigger={editTrigger}
						triggerIndex={triggerIndex}
						removeTrigger={removeTrigger}
					/>
				))}
				{!canShowTriggerBuilder && <CancelButton skipMarginBottom click={show}>Show Triggers List</CancelButton>}
				{canShowTriggerBuilder && <CancelButton skipMarginBottom={!isListPresence} click={addTrigger}>Add Trigger</CancelButton>}
				{canShowTriggerBuilder && isListPresence && <CancelButton skipMarginBottom click={close}>Hide TriggersList</CancelButton>}
			</Label>
		</div>
	)
}

interface IResponseProps {
	response: IResponse;
	responseIndex: number;
	removeResponse: (responseIndex: number) => void;
	editResponse: (value: string, responseIndex: number) => void;
}

const Response: FC<IResponseProps> = ({ response, responseIndex, editResponse, removeResponse }) => {
	const responseRef = useRef<HTMLDivElement>(null);
	const removeIconRef = useRef<HTMLDivElement>(null);

	const onEditResponse = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		editResponse(e.target.value, responseIndex);
	}, [editResponse, responseIndex]);

	const showRemoveIcon = useCallback(() => {
		if(removeIconRef.current) {
			removeIconRef.current.classList.remove("chat-icon-hide");
			removeIconRef.current.classList.add("chat-icon-show");
		}
	}, [removeIconRef]);

	const hideRemoveIcon = useCallback(() => {
		if(removeIconRef.current) {
			removeIconRef.current.classList.remove("chat-icon-show");
			removeIconRef.current.classList.add("chat-icon-hide");
		}
	}, [removeIconRef]);

	const removeResponseCallback = useCallback((e: MouseEvent<HTMLElement>) => {
		e?.stopPropagation();
		removeResponse(responseIndex);
	}, [responseIndex, removeResponse]);

	useLayoutEffect(() => {
		const optionElement = responseRef.current;

		if(optionElement) {
			optionElement.addEventListener("mouseenter", showRemoveIcon);
			optionElement.addEventListener("mouseleave", hideRemoveIcon);
		}

		return () => {
			if(optionElement) {
				optionElement.removeEventListener("mouseenter", showRemoveIcon);
				optionElement.removeEventListener("mouseleave", hideRemoveIcon);
			}
		}
	}, [responseRef, showRemoveIcon, hideRemoveIcon]);

	return(
		<Label color="secondary">
			<div ref={responseRef} className="flex">
				<Input
					type="text" 
					onBlur={onEditResponse} 
					inputValue={response.title}
				/>
				<i 
					ref={removeIconRef}
					onClick={removeResponseCallback}
					className="chat-icon-remove chat-icon chat-icon-hide color-remove mv-auto mg-5" 
				/>
			</div>
		</Label>
	)
}

interface IResponsesBlockProps {
	commandIndex: number;
	responsesList: IResponse[];
	changeResponsesList: Dispatch<SetStateAction<IResponse[]>>;
}

const ResponsesBlock: FC<IResponsesBlockProps> = ({ responsesList, commandIndex, changeResponsesList }) => {
	const [canShowResponseBuilder, showResponseBuilder] = useState(false);

	const saveResponse = useCallback((e: MouseEvent<HTMLElement>) => {
		e?.stopPropagation();
		changeResponsesList(prev => [...prev, { _id: generateId(), title: "" }]);
	}, [changeResponsesList]);

	const show = useCallback((e: MouseEvent<HTMLElement>) => {
		e?.stopPropagation();
		showResponseBuilder(true);
	}, [showResponseBuilder]);

	const close = useCallback((e: MouseEvent<HTMLElement>) => {
		e?.stopPropagation();
		showResponseBuilder(false);
	}, [showResponseBuilder]);

	const editResponse = useCallback((responseTitle: string, responseIndex: number) => {
		if(!responseTitle) {
			return;
		}

		changeResponsesList((prev) => {
			if(responseIndex >= 0) {
				const filteredPrev = JSON.parse(JSON.stringify(prev));
				filteredPrev.splice(responseIndex, 1);
				const title = correctDuplicatedString(responseTitle, filteredPrev, 0, 'title');

				prev.splice(responseIndex, 1, {...prev[responseIndex], title});
			}

			return JSON.parse(JSON.stringify(prev));
		});
	}, [changeResponsesList]);

	const removeResponse = useCallback((responseIndex: number) => {
		if(responseIndex >= 0) {
			changeResponsesList(prev => {
				prev.splice(responseIndex, 1);
				return JSON.parse(JSON.stringify(prev));
			});
		}
	}, [changeResponsesList]);

	const isListPresence = Array.isArray(responsesList) && !!responsesList.length;

	return(
		<div className="option">
			<Label skipMarginBottom color="secondary">
				{canShowResponseBuilder && isListPresence && responsesList.map((response, responseIndex) => (
					<Response
						key={response._id}
						response={response}
						editResponse={editResponse} 
						responseIndex={responseIndex}
						removeResponse={removeResponse}
					/>
				))}
				{!canShowResponseBuilder && <CancelButton skipMarginBottom click={show}>Show Responses List</CancelButton>}
				{canShowResponseBuilder && <CancelButton skipMarginBottom={!isListPresence} click={saveResponse}>Add Response</CancelButton>}
				{canShowResponseBuilder && isListPresence && <CancelButton skipMarginBottom click={close}>Hide Responses List</CancelButton>}
			</Label>
		</div>
	)
}

interface IMenuOptionActionTypeSelectorProps {
	menuOption: IMenuOption;
	commandIndex: number;
	menuOptionIndex: number;
	isCommandHasLiveAgentTrigger: boolean;
	editActionTypeField: (actionType: string, menuOptionIndex: number) => void;
}

const MenuOptionActionTypeSelector: FC<IMenuOptionActionTypeSelectorProps> = ({ menuOption, commandIndex, menuOptionIndex, isCommandHasLiveAgentTrigger, editActionTypeField }) => {
	const changeMenuOptionActionTypeCallback = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
		editActionTypeField(e.target.value, menuOptionIndex);
	}, [commandIndex, menuOptionIndex]);

	const resetBrowserEvents = (e: MouseEvent<HTMLSelectElement>) => {
		e?.preventDefault();
		e?.stopPropagation();
	};

	return(
		<Label color="secondary" title="Action type">
			<select
				onClick={resetBrowserEvents}
				value={menuOption.actionType}
				className="option-input flex flex-grow" 
				onChange={changeMenuOptionActionTypeCallback}
			>
				<option value="liveAgentTrigger" disabled={isCommandHasLiveAgentTrigger}>Live Agent Trigger</option>
				<option value="messageTrigger" defaultChecked>Message Trigger</option>
			</select>
		</Label>
	);
};

interface IMenuOptionDetailsProps {
	menuOption: IMenuOption;
	commandIndex: number;
	menuOptionIndex: number;
	isCommandHasLiveAgentTrigger: boolean;
	editLinkField: (value: string, menuOptionIndex: number) => void;
	editTitleField: (value: string, menuOptionIndex: number) => void;
	editActionTypeField: (actionType: string, menuOptionIndex: number) => void;
}

const MenuOptionDetails: FC<IMenuOptionDetailsProps> = ({ menuOption, commandIndex, menuOptionIndex, isCommandHasLiveAgentTrigger, editTitleField, editLinkField, editActionTypeField }) => {
	const editTitleFieldCallback = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		e?.stopPropagation();
		editTitleField(e.target.value, menuOptionIndex);
	}, [menuOptionIndex, editTitleField]);

	const editLinkFieldCallback = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		e?.stopPropagation();
		editLinkField(e.target.value, menuOptionIndex);
	}, [menuOptionIndex, editLinkField]);

	return(
		<div className="flex flex-col">
			<MenuOptionActionTypeSelector
				menuOption={menuOption} 
				commandIndex={commandIndex} 
				menuOptionIndex={menuOptionIndex}
				editActionTypeField={editActionTypeField}
				isCommandHasLiveAgentTrigger={isCommandHasLiveAgentTrigger}
			/>
			<Label color="secondary" title="Title">
				<Input
					type="text"
					inputValue={menuOption.title}
					onBlur={editTitleFieldCallback}
				/>
			</Label>
			{menuOption.actionType !== "liveAgentTrigger" && (
				<React.Fragment>
					<Label color="secondary" title="Link">
						<Input
							type="text"
							inputValue={menuOption.link}
							onBlur={editLinkFieldCallback}
						/>
					</Label>
				</React.Fragment>
			)}
		</div>
	);
};

interface IMenuOptionProps {
	menuOption: IMenuOption;
	commandIndex: number;
	menuOptionIndex: number;
	isCommandHasLiveAgentTrigger: boolean;
	removeMenuOption: (menuOptionIndex: number) => void;
	editLinkField: (link: string, menuOptionIndex: number) => void;
	editTitleField: (title: string, menuOptionIndex: number) => void;
	editActionTypeField: (actionType: string, menuOptionIndex: number) => void;
}

const MenuOption: FC<IMenuOptionProps> = memo(({ menuOption, commandIndex, menuOptionIndex, isCommandHasLiveAgentTrigger, editTitleField, editLinkField, removeMenuOption, editActionTypeField }) => {
	const optionRef = useRef<HTMLDivElement>(null);
	const removeIconRef = useRef<HTMLDivElement>(null);
	
	const [canShowDetails, showDetails] = useState(false);

	const toggleShowingState = useCallback((e: MouseEvent<HTMLElement>) => {
		e?.stopPropagation();
		showDetails(prev => !prev);
	}, [showDetails]);

	const showRemoveIcon = useCallback(() => {
		if(removeIconRef.current && !canShowDetails) {
			removeIconRef.current.classList.remove("chat-icon-hide");
			removeIconRef.current.classList.add("chat-icon-show");
		}
	}, [canShowDetails, removeIconRef]);

	const hideRemoveIcon = useCallback(() => {
		if(removeIconRef.current) {
			removeIconRef.current.classList.remove("chat-icon-show");
			removeIconRef.current.classList.add("chat-icon-hide");
		}
	}, [removeIconRef]);

	const removeOptionMenuCallback = useCallback((e: MouseEvent<HTMLElement>) => {
		e?.stopPropagation();
		removeMenuOption(menuOptionIndex);
	}, [menuOptionIndex, removeMenuOption]);

	useLayoutEffect(() => {
		const optionElement = optionRef.current;

		if(optionElement) {
			optionElement.addEventListener("mouseenter", showRemoveIcon);
			optionElement.addEventListener("mouseleave", hideRemoveIcon);
		}

		return () => {
			if(optionElement) {
				optionElement.removeEventListener("mouseenter", showRemoveIcon);
				optionElement.removeEventListener("mouseleave", hideRemoveIcon);
			}
		}
	}, [optionRef, showRemoveIcon, hideRemoveIcon]);

	return(
		<div 
			ref={optionRef} 
			className="sub-option flex" 
			onClick={toggleShowingState}
		>
			{canShowDetails 
				?	<MenuOptionDetails
						menuOption={menuOption}
						commandIndex={commandIndex} 
						editLinkField={editLinkField}
						editTitleField={editTitleField}
						menuOptionIndex={menuOptionIndex}
						editActionTypeField={editActionTypeField}
						isCommandHasLiveAgentTrigger={isCommandHasLiveAgentTrigger}
					/>
				:	<div className="flex flex-center flex-grow bg-secondary color-primary overflow-hidden text-ellipsis whitespace-nowrap br-5 cursor-pointer">
						{menuOption.title || `Option #${menuOptionIndex + 1}`}
					</div>
			}
			<i 
				ref={removeIconRef}
				onClick={removeOptionMenuCallback}
				className="chat-icon-remove chat-icon chat-icon-hide color-remove mv-auto mg-5" 
			/>
		</div>
	)
});

interface IOptionProps {
	children: ReactChildren;
	skipMarginBottom?: boolean;
}

const Option: FC<IOptionProps> = ({ skipMarginBottom, children }) => {
	const baseClassName = "option";
	const className = skipMarginBottom
		? 	`${baseClassName} mb-0`
		: 	baseClassName
	;
	
	return(
		<div className={className}>
			{children}
		</div>
	)
}

interface IMenuBlock {
	commandIndex: number;
	skipMarginBottom?: boolean;
	menuOptionsList: IMenuOption[];
	isCommandHasLiveAgentTrigger: boolean;
	changeMenuOptionsList: Dispatch<SetStateAction<IMenuOption[]>>;
}

const MenuBlock: FC<IMenuBlock> = ({ menuOptionsList, commandIndex, isCommandHasLiveAgentTrigger, changeMenuOptionsList, skipMarginBottom }) => {
	const [canShowMenuBuilder, showMenuBuilder] = useState(false);

	const saveMenu = useCallback((e: MouseEvent<HTMLElement>) => {
		e?.stopPropagation();
		changeMenuOptionsList(prev => [...prev, { _id: generateId(), title: "", link: "", actionType: "messageTrigger" }]);
	}, [changeMenuOptionsList]);

	const removeMenuOption = useCallback((menuOptionIndex: number) => {
		if(menuOptionIndex >= 0) {
			changeMenuOptionsList(prev => {
				prev.splice(menuOptionIndex, 1);

				return JSON.parse(JSON.stringify(prev));
			});
		}
	}, [changeMenuOptionsList]);

	const show = useCallback((e: MouseEvent<HTMLElement>) => {
		e?.stopPropagation();
		showMenuBuilder(true);
	}, []);

	const close = useCallback((e: MouseEvent<HTMLElement>) => {
		e?.stopPropagation();
		showMenuBuilder(false);
	}, []);

	const editTitleField = useCallback((optionTitle: string, optionIndex: number) => {
		if(!optionTitle) {
			return;
		}

		changeMenuOptionsList(prev => {
			if(optionIndex >= 0) {
				const title = correctDuplicatedString(optionTitle, prev, 0, 'title');
				prev.splice(optionIndex, 1, {...prev[optionIndex], title});
				
				return JSON.parse(JSON.stringify(prev));
			}

			return prev;
		});
	}, [changeMenuOptionsList]);

	const editTitleLinkField = useCallback((optionLink: string, optionIndex: number) => {
		if(!optionLink) {
			return;
		}

		changeMenuOptionsList(prev => {
			if(optionIndex >= 0) {
				prev.splice(optionIndex, 1, {...prev[optionIndex], link: optionLink});
				
				return JSON.parse(JSON.stringify(prev));
			}

			return prev;
		});
	}, [changeMenuOptionsList]);

	const editActionTypeField = useCallback((actionType: string, optionIndex: number) => {
		if(!actionType) {
			return;
		}

		changeMenuOptionsList(prev => {
			if(optionIndex >= 0) {
				prev.splice(optionIndex, 1, {...prev[optionIndex], actionType});
				
				return JSON.parse(JSON.stringify(prev));
			}

			return prev;
		});
	}, [changeMenuOptionsList]);

	const isMenuOptionsListExisting = Array.isArray(menuOptionsList) && !!menuOptionsList.length;

	return(
		<Option skipMarginBottom={skipMarginBottom}>
			<Label skipMarginBottom color="secondary">
				{canShowMenuBuilder && isMenuOptionsListExisting && menuOptionsList.map((menuOption, menuOptionIndex) => (
					<MenuOption
						key={menuOption._id}
						menuOption={menuOption}
						commandIndex={commandIndex}
						menuOptionIndex={menuOptionIndex}
						editTitleField={editTitleField}
						editLinkField={editTitleLinkField}
						removeMenuOption={removeMenuOption}
						editActionTypeField={editActionTypeField}
						isCommandHasLiveAgentTrigger={isCommandHasLiveAgentTrigger}
					/>
				))}
				{!canShowMenuBuilder && <CancelButton skipMarginBottom click={show}>Show Menu Options</CancelButton>}
				{canShowMenuBuilder && <CancelButton skipMarginBottom={!isMenuOptionsListExisting} click={saveMenu}>Add Option</CancelButton>}
				{canShowMenuBuilder && isMenuOptionsListExisting && <CancelButton skipMarginBottom click={close}>Hide Menu Options</CancelButton>}
			</Label>
		</Option>
	)
}

interface ICommandBuilderProps {
	close: () => void;
}

const CommandBuilder: FC<ICommandBuilderProps> = ({ close }) => {
	const addCommand = useBotSettings((state) => state.addCommand);
	const isCommandsHasGreeting =useBotSettings((state) => state.commandsSettings.isCommandsHasGreeting);
	const isCommandsHasRejecting = useBotSettings((state) => state.commandsSettings.isCommandsHasRejecting);

	const [title, changeTitle] = useState("");
	const [type, changeType] = useState("response");
	const [triggersList, changeTriggerList] = useState<ITrigger[]>([]);
	const [responsesList, changeResponsesList] = useState<IResponse[]>([]);
	const [menuOptionsList, changeMenuOptionsList] = useState<IMenuOption[]>([]);
	const canShowTriggerField = type !== "greeting" && type !== "rejecting";
	const isCommandHasLiveAgentTrigger = !!menuOptionsList.find((menuOption) => {
		return menuOption.actionType === "liveAgentTrigger";
	});

	const addCommandCallback = () => {
		const command = { 
			_id: generateId(), 
			type,
			title, 
			triggersList, 
			responsesList, 
			menuOptionsList,
		};

		if (!command.title || !command.type) {
			return;
		}

		if(addCommand(command)) {
			close();
		}
	}

	const changeTitleCallback = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		changeTitle(e.target.value);
	}, [changeTitle]);

	const changeTypeCallback = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
		changeType(e.target.value)
	}, [changeType]);

	return(
		<form onSubmit={addCommandCallback}>
			<div className="option">
				<Label skipMarginBottom color="secondary" title="Title">
					<Input 
						type="text" 
						inputValue={title} 
						onChange={changeTitleCallback} 
					/>
				</Label>
			</div>
			<div className="option">
				<Label skipMarginBottom color="secondary" title="Type">
					<select 
						name="type" 
						title="type" 
						value={type}
						className="option-input" 
						onChange={changeTypeCallback} 
					>
						<option disabled={isCommandsHasGreeting} className="option-input" value="greeting">Greeting</option>
						<option disabled={isCommandsHasRejecting} className="option-input" value="rejecting">Rejecting</option>
						<option className="option-input" value="response">Response</option>
					</select>
				</Label>
			</div>
			{canShowTriggerField && (
				<TriggersBlock
					commandIndex={0}
					triggersList={triggersList} 
					changeTriggerList={changeTriggerList} 
				/>
			)}
			<ResponsesBlock
				commandIndex={0}
				responsesList={responsesList}
				changeResponsesList={changeResponsesList}
			/>
			<MenuBlock
				commandIndex={0}
				menuOptionsList={menuOptionsList}
				changeMenuOptionsList={changeMenuOptionsList}
				isCommandHasLiveAgentTrigger={isCommandHasLiveAgentTrigger}
			/>
			<div className="flex flex-btw">
				<div className="btn save" onClick={addCommandCallback}>Save</div>
				<div className="btn cancel" onClick={close}>Cancel</div>
			</div>
		</form>
	)
}

const AddCommandField = () => {
	const [isShowBuilder, showBuilder] = useState(false);
	
	const show = useCallback(() => {
		showBuilder(true);
	}, [showBuilder]);

	const close = useCallback(() => {
		showBuilder(false);
	}, [showBuilder]);

	return(
		<div className="commandBuilder">
			{isShowBuilder && <CommandBuilder close={close} />}
			{!isShowBuilder && <div className="btn cancel" onClick={show}>Add Command</div>}
		</div>
	)
};

interface ICommandProps {
	command: ICommand;
	commandIndex: number;
}

const Command: FC<ICommandProps> = memo(({ command, commandIndex }) => {
	const commandRef = useRef<HTMLDivElement>(null);
	const removeIconRef = useRef<HTMLDivElement>(null);

	const isCommandHasLiveAgentTrigger = !!command.menuOptionsList.find((menuOption) => {
		return menuOption.actionType === "liveAgentTrigger";
	});

	const editCommand = useBotSettings((state) => state.editCommand);
	const removeCommand = useBotSettings((state) => state.removeCommand);

	const isCommandsHasGreeting = useBotSettings((state) => state.commandsSettings.isCommandsHasGreeting);
	const isCommandsHasRejecting = useBotSettings((state) => state.commandsSettings.isCommandsHasRejecting);

	const [canShowDetails, showDetails] = useState(false);
	const canShowTriggerField = command.type !== "greeting" && command.type !== "rejecting";

	const changeCommandTitle = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		e?.stopPropagation();
		const newCommand = JSON.parse(JSON.stringify(command));
		newCommand.title = e.target.value || newCommand.title;
		editCommand(newCommand, commandIndex);
	}, [command, commandIndex, editCommand]);

	const stopPropagation = useCallback((e: MouseEvent<HTMLSelectElement>) => {
		e?.stopPropagation();
	}, []);

	const changeCommandType = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
		e?.stopPropagation();
		const newCommand = JSON.parse(JSON.stringify(command));
		newCommand.type = e.target.value || newCommand.type;
		editCommand(newCommand, commandIndex);
	}, [command, commandIndex, editCommand]);

	const changeTriggerList = useCallback((callback: ((prev: ITrigger[]) => ITrigger[]) | ITrigger[]) => {
		const newCommand = JSON.parse(JSON.stringify(command));
		if(typeof callback !== "function") {
			newCommand.triggersList = callback;
		}

		if(typeof callback === "function") {
			newCommand.triggersList = callback(JSON.parse(JSON.stringify(newCommand.triggersList)));
		}
		editCommand(newCommand, commandIndex);
	}, [command, commandIndex, editCommand]);

	const changeResponsesList = useCallback((callback: ((prev: IResponse[]) => IResponse[]) | IResponse[]) => {
		const newCommand = JSON.parse(JSON.stringify(command));
		
		if(typeof callback !== "function") {
			newCommand.responsesList = callback;
		}

		if(typeof callback === "function") {
			newCommand.responsesList = callback(JSON.parse(JSON.stringify(newCommand.responsesList)));
		}

		editCommand(newCommand, commandIndex);
	}, [command, commandIndex, editCommand]);
	
	const changeMenuOptionsList = useCallback((callback: ((prev: IMenuOption[]) => IMenuOption[]) | IMenuOption[]) => {
		const newCommand = JSON.parse(JSON.stringify(command));
		
		if(typeof callback !== "function") {
			newCommand.menuOptionsList = callback;
		}

		if(typeof callback === "function") {
			newCommand.menuOptionsList = callback(JSON.parse(JSON.stringify(newCommand.menuOptionsList)));
		}

		editCommand(newCommand, commandIndex);
	}, [command, commandIndex, editCommand]);

	const removeCommandCallback = useCallback((e: MouseEvent<HTMLElement>) => {
		e?.stopPropagation();
		removeCommand(commandIndex);
	}, [commandIndex, removeCommand]);

	const showRemoveIcon = useCallback(() => {
		if(removeIconRef.current && !canShowDetails) {
			removeIconRef.current.classList.remove("chat-icon-hide");
			removeIconRef.current.classList.add("chat-icon-show");
		}
	}, [canShowDetails, removeIconRef]);

	const hideRemoveIcon = useCallback(() => {
		if(removeIconRef.current) {
			removeIconRef.current.classList.remove("chat-icon-show");
			removeIconRef.current.classList.add("chat-icon-hide");
		}
	}, [removeIconRef]);

	useLayoutEffect(() => {
		const commandElement = commandRef.current;

		if(commandElement) {
			commandElement.addEventListener("mouseenter", showRemoveIcon);
			commandElement.addEventListener("mouseleave", hideRemoveIcon);
		}

		return () => {
			if(commandElement) {
				commandElement.removeEventListener("mouseenter", showRemoveIcon);
				commandElement.removeEventListener("mouseleave", hideRemoveIcon);
			}
		}
	}, [commandRef, showRemoveIcon, hideRemoveIcon]);

	const showDetailsCallback = useCallback(() => {
		hideRemoveIcon();
		showDetails(prev => !prev);
	}, [showDetails, hideRemoveIcon]);

	return(
		<div
			ref={commandRef}
			className="command"
			onMouseEnter={showRemoveIcon} 
			onClick={showDetailsCallback} 
		>
			<div className="flex flex-col flex-grow mw-full">
				{canShowDetails
					? <React.Fragment>
							<div className="option">
								<Label skipMarginBottom color="secondary" title="Title">
									<Input 
										type="text" 
										inputValue={command.title} 
										onChange={changeCommandTitle} 
									/>
								</Label>
							</div>
							<div className="option">
								<Label skipMarginBottom color="secondary" title="Type">
								<select 
									title="type"
									value={command.type}
									className="option-input" 
									onClick={stopPropagation}
									onChange={changeCommandType} 
								>
									<option disabled={isCommandsHasGreeting} className="option-input" value="greeting">Greeting</option>
									<option disabled={isCommandsHasRejecting} className="option-input" value="rejecting">Rejecting</option>
									<option className="option-input" value="response">Response</option>
								</select>
								</Label>
							</div>
							{canShowTriggerField && (
								<TriggersBlock
									commandIndex={commandIndex}
									triggersList={command.triggersList}
									changeTriggerList={changeTriggerList} 
								/>
							)}
							<ResponsesBlock 
								commandIndex={commandIndex}
								responsesList={command.responsesList}
								changeResponsesList={changeResponsesList}
							/>
							<MenuBlock
								skipMarginBottom
								commandIndex={commandIndex}
								menuOptionsList={command.menuOptionsList}
								changeMenuOptionsList={changeMenuOptionsList}
								isCommandHasLiveAgentTrigger={isCommandHasLiveAgentTrigger}
							/>
						</React.Fragment>
					: <div className="btn cancel text-ellipsis whitespace-pre w-full">{command.title}</div>
				}
			</div>
			<i 
				ref={removeIconRef}
				onClick={removeCommandCallback}
				className="chat-icon-remove chat-icon chat-icon-hide color-remove mv-auto mg-5" 
			/>
		</div>
	)
});

const CommandsList: FC = () => {
	const commandsList = useBotSettings(state => state.commandsSettings.commandsList);

	if(!Array.isArray(commandsList)) {
		return null;
	}

	return (
		<React.Fragment>
			{commandsList.map((command, commandIndex) => (
				<Command 
					key={command._id} 
					command={command} 
					commandIndex={commandIndex} 
				/>
			))}
		</React.Fragment>
	);
}

const CommandsListField = () => {
	return(
		<div className="commandsList">
			<CommandsList />
			<AddCommandField />
		</div>
	)
}

export default CommandsListField;
