import axios from 'axios';
import { Login, Registration, UserToken } from '../../../../types';
import { axiosWrapper } from './axiosWrapper';

const baseUrl = '/api/user';

let token: string;

const setToken = (newToken: string): void => {
    token = `bearer ${newToken}`;
};

const getAuthHeader = (): { Authorization: string } => {
    return { Authorization: token };
};

const getAuthConfig = (): { headers: { Authorization: string } } => ({
    headers: getAuthHeader(),
});

const createUser = async (user: Registration): Promise<boolean> => {
    return (
        (await axiosWrapper(axios.post(`${baseUrl}/register`, user))) !==
        undefined
    );
};

const loginUser = async (user: Login): Promise<UserToken | undefined> => {
    const response = await axiosWrapper(
        axios.post<UserToken>(`${baseUrl}/login`, user)
    );
    response && setToken(response.token);
    return response;
};

const logoutUser = (): void => {
    setToken('');
};

const checkLogin = async (token: UserToken): Promise<boolean> => {
    const response = await axiosWrapper(
        axios.post<{ valid: boolean }>(`${baseUrl}/validity`, token)
    );

    console.log('What is response?');
    console.log(response);

    if (response) {
        return response.valid;
    }

    return false;
};

export {
    createUser,
    loginUser,
    logoutUser,
    getAuthHeader,
    getAuthConfig,
    setToken,
    checkLogin,
};
