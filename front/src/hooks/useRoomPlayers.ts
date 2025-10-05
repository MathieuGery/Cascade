'use client';

import { useState, useEffect } from 'react';
import {
  getRoomFromLocalStorage,
  saveRoomToLocalStorage,
  addPlayerToLocalStorage,
  removePlayerFromLocalStorage,
  type Player,
  type RoomData
} from '@/utils/localStorage';

/**
 * Hook personnalisé pour gérer les joueurs d'une room avec localStorage
 * @param roomName - Le nom de la room à gérer
 */
export const useRoomPlayers = (roomName?: string) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);

  // Charger les données initiales
  useEffect(() => {
    const loadRoomData = () => {
      setLoading(true);
      const data = getRoomFromLocalStorage(roomName);
      setRoomData(data);
      setPlayers(data?.players || []);
      setLoading(false);
    };

    loadRoomData();

    // Écouter les changements dans localStorage (entre onglets)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'marble-race-room-data') {
        loadRoomData();
      }
    };

    // Écouter les événements personnalisés (même onglet)
    const handleRoomDataUpdated = (event: CustomEvent) => {
      const { roomName: updatedRoomName } = event.detail;
      if (!roomName || updatedRoomName === roomName) {
        loadRoomData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('roomDataUpdated', handleRoomDataUpdated as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('roomDataUpdated', handleRoomDataUpdated as EventListener);
    };
  }, [roomName]);

  // Ajouter un joueur
  const addPlayer = (playerName: string) => {
    addPlayerToLocalStorage(playerName, roomName);
    // Recharger les données
    const updatedData = getRoomFromLocalStorage(roomName);
    if (updatedData) {
      setRoomData(updatedData);
      setPlayers(updatedData.players);
    }
  };

  // Retirer un joueur
  const removePlayer = (playerName: string) => {
    removePlayerFromLocalStorage(playerName, roomName);
    // Recharger les données
    const updatedData = getRoomFromLocalStorage(roomName);
    if (updatedData) {
      setRoomData(updatedData);
      setPlayers(updatedData.players);
    }
  };

  // Mettre à jour l'état de la room
  const updateRoomState = (newState: 'waiting' | 'in-game' | 'finished') => {
    if (roomData) {
      const updatedRoom = { ...roomData, state: newState };
      saveRoomToLocalStorage(updatedRoom);
      setRoomData(updatedRoom);
    }
  };

  // Vérifier si un joueur est présent
  const hasPlayer = (playerName: string): boolean => {
    return players.some(player => player.name === playerName);
  };

  // Obtenir le nombre de joueurs
  const playerCount = players.length;

  return {
    players,
    roomData,
    loading,
    addPlayer,
    removePlayer,
    updateRoomState,
    hasPlayer,
    playerCount
  };
};
