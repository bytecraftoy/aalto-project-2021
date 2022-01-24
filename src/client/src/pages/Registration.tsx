import React from 'react'
import { RegistrationForm } from '../components/registrationForm'
import { NavLink } from 'react-router-dom';
import { createUser } from '../services/userService';


export const Registration: React.FC = () => {

    return (
        <div>
            <NavLink to="/"> Home </NavLink>
            <NavLink to="/user/login"> Login </NavLink>
            <RegistrationForm createUser={createUser}/>
        </div>
    )
}