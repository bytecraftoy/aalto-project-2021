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
                    <label htmlFor="email">Email</label>
                    <div>
                        <input
                            name="email"
                            id="email"
                            value={email}
                            onChange={({ target }) => setEmail(target.value)}
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="username">Username</label>
                    <div>
                        <input
                            name="username"
                            id="username"
                            value={username}
                            onChange={({ target }) => setUsername(target.value)}
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
                            required
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="psw-repeat">Confirm Password</label>
                    <div>
                        <input
                            type="password"
                            name="psw-repeat"
                            id="psw-repeat"
                            value={confirm}
                            onChange={({ target }) => setConfirm(target.value)}
                            required
                        />
                    </div>
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
