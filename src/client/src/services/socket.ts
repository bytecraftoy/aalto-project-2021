import React from 'react';
import io from 'socket.io-client';

export const socket = io('http://localhost:8051/project');
export const SocketContext = React.createContext(socket);
