import config from "../api/config"

export const audio = (path) => {
    return new Audio(`${config.baseApiUrl}/uploads/audio/${path}`);
}