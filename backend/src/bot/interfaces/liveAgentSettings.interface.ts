export interface ILiveChatDuration {
    enabled: boolean;
    duration: number;
}

export interface ILiveAgentSettings {
    triggerLink: string;
	responseDuration: number;
    liveChatDuration: {
        enabled: boolean;
        duration: number;
    }
}
