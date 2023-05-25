export interface IMenuOption {
	_id: string;
	title: string;
	link: string;
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
