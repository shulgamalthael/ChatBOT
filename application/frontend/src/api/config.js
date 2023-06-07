let port = "";
let host = "localhost";
let protocol = "https";

host = API_HOST || host;
protocol = API_PROTOCOL || port;
port = API_PORT ? `:${API_PORT}` : port;

const baseApiUrl = `${protocol}://${host}${port}`;

console.log({ baseApiUrl });

const config = {
	baseApiUrl,
};

export default config;