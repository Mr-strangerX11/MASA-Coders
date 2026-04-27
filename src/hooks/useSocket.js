'use client';
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

let sharedSocket = null;

export function useSocket() {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!sharedSocket) {
      sharedSocket = io({
        path: '/api/socket',
        transports: ['websocket', 'polling'],
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });
    }
    socketRef.current = sharedSocket;

    const onConnect    = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socketRef.current.on('connect',    onConnect);
    socketRef.current.on('disconnect', onDisconnect);
    if (socketRef.current.connected) setConnected(true);

    return () => {
      socketRef.current?.off('connect',    onConnect);
      socketRef.current?.off('disconnect', onDisconnect);
    };
  }, []);

  return { socket: socketRef.current, connected };
}
