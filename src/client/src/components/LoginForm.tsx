import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Login, UserToken } from '../../../../types';
import { Logo } from './Logo';

export interface LoginFormProps {
    loginUser: (user: Login) => Promise<UserToken | undefined>;
    setUser: React.Dispatch<React.SetStateAction<UserToken | null>>;
}

export const LoginForm = (props: LoginFormProps): JSX.Element => {
    const [emailUser, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errMessage, setErr] = useState(['']);

    const navigate = useNavigate();

    const errTimeout = (message: string) => {
        setErr(errMessage.concat(message));

        setTimeout(() => {
            setErr(['']);
        }, 5000);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const user: Login = {
            email: null,
            password: password,
            username: null,
        };

        if (emailUser.length === 0 || password.length === 0) {
            errTimeout('Fill all necessary fields');
            return;
        }

        if (emailUser.includes('@')) {
            user.email = emailUser;
        } else {
            user.username = emailUser;
        }

        const res = await props.loginUser(user);

        if (res) {
            const userInfo = JSON.stringify(res);
            window.localStorage.setItem('loggedGraphUser', userInfo);

            setEmail('');
            setPassword('');
            props.setUser(res);
            navigate('/');
            toast('✔️ Login successful');
        }
    };

    return (
        <div>
            <div>
                <Logo />
            </div>
            <div className="form-box-login">
                <form onSubmit={handleSubmit}>
                    <h1>Login</h1>
                    {errMessage.map((e) => (
                        <p id="login-error" key={e}>
                            {e}
                        </p>
                    ))}
                    <div>
                        <label htmlFor="email">Email or Username</label>
                        <div>
                            <input
                                name="emailUser"
                                id="emailUser"
                                value={emailUser}
                                onChange={({ target }) => setEmail(target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="psw">Password</label>
                        <div>
                            <input
                                type="password"
                                name="psw"
                                id="psw"
                                value={password}
                                onChange={({ target }) => setPassword(target.value)}
                            />
                        </div>
                    </div>
                    <button
                        id="login-button"
                        type="submit"
                        className="button-action-one"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};
