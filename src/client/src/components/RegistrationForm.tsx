import React, { useState } from 'react';
import { RegisterFormProps, Registration } from '../../../../types';
import './styles/Form.css';
import toast from 'react-hot-toast';

export const RegistrationForm: ({
    createUser,
}: RegisterFormProps) => JSX.Element = ({ createUser }: RegisterFormProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [errMessage, setErr] = useState(['']);
    const [username, setUsername] = useState('');

    const errTimeout = () => {
        setTimeout(() => {
            setErr(['']);
        }, 5000);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (
            email.length == 0 ||
            password.length == 0 ||
            confirm.length == 0 ||
            username.length == 0
        ) {
            setErr(
                errMessage
                    .concat('Fill all the necessary information')
                    .filter((x) => x !== '')
            );
            errTimeout();
            return;
        }

        if (!email.includes('@')) {
            setErr(errMessage.concat('@ missing from the email'));
            errTimeout();
            return;
        }

        if (password.length < 12) {
            setErr(
                errMessage.concat(
                    'Password must be at least 12 characters long'
                )
            );
            errTimeout();
            return;
        }

        if (password !== confirm) {
            setErr(
                errMessage
                    .concat('Passwords do not match!')
                    .filter((x) => x !== '')
            );
            errTimeout();
            return;
        }

        const user: Registration = {
            email,
            username,
            password,
        };

        if (await createUser(user)) {
            toast('✔️ Account created');
            setEmail('');
            setPassword('');
            setConfirm('');
            setUsername('');
        } else {
            setErr(errMessage.concat('Error occured when creating a user'));
            errTimeout();
        }
    };

    return (
        <div className="form-box-reg">
            <form onSubmit={handleSubmit}>
                <h1>Register</h1>
                {errMessage.map((e, i) => (
                    <p id="register-error" key={i}>
                        {e}
                    </p>
                ))}
                <div>
                    <label htmlFor="email"></label>
                    <input
                        placeholder="Enter Email"
                        name="email"
                        id="email"
                        value={email}
                        onChange={({ target }) => setEmail(target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="username"></label>
                    <input
                        placeholder="Enter Username"
                        name="username"
                        id="username"
                        value={username}
                        onChange={({ target }) => setUsername(target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="psw"></label>
                    <input
                        type="password"
                        placeholder="Enter Password"
                        name="psw"
                        id="psw"
                        value={password}
                        onChange={({ target }) => setPassword(target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="psw-repeat"></label>
                    <input
                        type="password"
                        placeholder="Repeat Password"
                        name="psw-repeat"
                        id="psw-repeat"
                        value={confirm}
                        onChange={({ target }) => setConfirm(target.value)}
                        required
                    />
                </div>

                <button
                    id="register-button"
                    type="submit"
                    className="button-action-one"
                >
                    Register
                </button>
            </form>
        </div>
    );
};
