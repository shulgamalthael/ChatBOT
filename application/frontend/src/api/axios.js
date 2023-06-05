/* axios */
import axios from 'axios';

/* config */
import config from './config';

const defaultResponse = JSON.stringify({
  data: null,
  error: null,
  response: null,
  isError: false,
  isFetched: false,
  isPending: false
});

export const parseDefaultResponse = () => JSON.parse(defaultResponse);

const requestHandler = (req, res, responseData) => {
  if (typeof req === 'number') {
    axios.interceptors.request.eject(req);
  }

  if (typeof res === 'number') {
    axios.interceptors.response.eject(res);
  }

  if (!responseData) return parseDefaultResponse();

  return responseData;
};

export async function request(
  url,
  method,
  body
) {
  let _response = JSON.parse(defaultResponse);
  const _body = body || {};

  if (!url)
    return Object.assign({}, _response, {
      isError: true,
      error: 'invalid url!',
    });
  const req = axios.interceptors.request.use(
    (config) => {
      _response = parseDefaultResponse();
      _response.isPending = true;
      return Promise.resolve(config);
    },
    (error) => {
      _response = parseDefaultResponse();
      _response.error = error;
      _response.isError = true;
      return Promise.resolve(error);
    }
  );

  const res = axios.interceptors.response.use(
    (response) => {
      _response = parseDefaultResponse();
      if(response.status < 400) {
				_response.isFetched = true;
      	_response.data = response.data;
			}
			if(response.response && response.response.status >= 400) {
				_response.isError = true;
				_response.error = response.response.statusText;
			} 
			_response.response = response;
      return Promise.resolve(response);
    },
    (error) => {
      _response = parseDefaultResponse();
      _response.error = error;
      _response.isError = true;
      return Promise.resolve(error);
    }
  );

  const options = [url, _body];

  switch (method) {
    case 'GET':
      await axios.get(...options);
      break;
    case 'PUT':
      await axios.put(...options);
      break;
    case 'HEAD':
      await axios.head(...options);
      break;
    case 'POST':
      await axios.post(...options);
      break;
    case 'PATCH':
      await axios.patch(...options);
      break;
    case 'DELETE':
      await axios.delete(...options);
      break;
		default:
			await axios.get(...options);
			break;
  }

  return requestHandler(req, res, _response);
};

function initAxios() {
  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = config.baseApiUrl;
};

export default initAxios;