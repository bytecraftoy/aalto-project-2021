import React from 'react';
import { Logo } from '../components/Logo';
import { RegistrationForm } from '../components/RegistrationForm';
import { createUser } from '../services/userService';

export const Registration: React.FC = () => {
    return (
        <div>
            <Logo/>
            <RegistrationForm createUser={createUser} />
        </div>
    )
};
