// Utilitaire pour gérer les données localStorage du jeu de course de billes

// Types pour le localStorage
export interface Player {
  name: string;
}

export interface RoomData {
  name: string;
  players: Player[];
  state: 'waiting' | 'in-game' | 'finished';
  lastUpdated: number;
}

// Clés pour le localStorage
const STORAGE_KEYS = {
  CURRENT_ROOM: 'marble-race-current-room',
  ROOM_DATA: 'marble-race-room-data',
  PLAYER_NAME: 'marble-race-player-name'
} as const;

/**
 * Sauvegarde les données d'une room dans le localStorage
 * @param roomData - Les données de la room à sauvegarder
 */
export const saveRoomToLocalStorage = (roomData: RoomData): void => {
  try {
    const dataWithTimestamp = {
      ...roomData,
      lastUpdated: Date.now()
    };
    localStorage.setItem(STORAGE_KEYS.ROOM_DATA, JSON.stringify(dataWithTimestamp));
    localStorage.setItem(STORAGE_KEYS.CURRENT_ROOM, roomData.name);
    console.log('Données de room sauvegardées:', dataWithTimestamp);

    // Émettre un événement personnalisé pour notifier les composants
    window.dispatchEvent(new CustomEvent('roomDataUpdated', {
      detail: { roomName: roomData.name, roomData: dataWithTimestamp }
    }));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde dans localStorage:', error);
  }
};

/**
 * Récupère les données d'une room depuis le localStorage
 * @param roomName - Le nom de la room à récupérer (optionnel)
 * @returns Les données de la room ou null si non trouvées
 */
export const getRoomFromLocalStorage = (roomName?: string): RoomData | null => {
  try {
    const targetRoom = roomName || localStorage.getItem(STORAGE_KEYS.CURRENT_ROOM);
    if (!targetRoom) return null;

    const storedData = localStorage.getItem(STORAGE_KEYS.ROOM_DATA);
    if (!storedData) return null;

    const roomData: RoomData = JSON.parse(storedData);

    // Vérifier si les données ne sont pas trop anciennes (1 heure)
    const oneHour = 60 * 60 * 1000;
    if (Date.now() - roomData.lastUpdated > oneHour) {
      console.log('Données de room trop anciennes, suppression');
      clearRoomFromLocalStorage();
      return null;
    }

    if (roomData.name === targetRoom) {
      console.log('📂 Données de room récupérées:', roomData);
      return roomData;
    }

    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération depuis localStorage:', error);
    return null;
  }
};

/**
 * Efface les données de room du localStorage
 */
export const clearRoomFromLocalStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.ROOM_DATA);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_ROOM);
    console.log('Données de room supprimées du localStorage');
  } catch (error) {
    console.error('Erreur lors de la suppression du localStorage:', error);
  }
};

/**
 * Ajoute un joueur à la room dans le localStorage
 * @param playerName - Le nom du joueur à ajouter
 * @param roomName - Le nom de la room (optionnel, utilise la room courante par défaut)
 */
export const addPlayerToLocalStorage = (playerName: string, roomName?: string): void => {
  const roomData = getRoomFromLocalStorage(roomName);
  if (!roomData) {
    console.warn('Impossible d\'ajouter le joueur: room non trouvée dans localStorage');
    return;
  }

  // Vérifier si le joueur n'existe pas déjà
  if (!roomData.players.find(p => p.name === playerName)) {
    roomData.players.push({ name: playerName });
    saveRoomToLocalStorage(roomData);
    console.log('👤 Joueur ajouté à la room:', playerName);
  } else {
    console.log('👤 Joueur déjà présent dans la room:', playerName);
  }
};

/**
 * Retire un joueur de la room dans le localStorage
 * @param playerName - Le nom du joueur à retirer
 * @param roomName - Le nom de la room (optionnel, utilise la room courante par défaut)
 */
export const removePlayerFromLocalStorage = (playerName: string, roomName?: string): void => {
  const roomData = getRoomFromLocalStorage(roomName);
  if (!roomData) {
    console.warn('⚠️ Impossible de retirer le joueur: room non trouvée dans localStorage');
    return;
  }

  roomData.players = roomData.players.filter(p => p.name !== playerName);
  saveRoomToLocalStorage(roomData);
  console.log('👤 Joueur retiré de la room:', playerName);
};

/**
 * Récupère la liste des joueurs présents dans la room
 * @param roomName - Le nom de la room (optionnel, utilise la room courante par défaut)
 * @returns La liste des joueurs ou un tableau vide
 */
export const getPlayersFromLocalStorage = (roomName?: string): Player[] => {
  const roomData = getRoomFromLocalStorage(roomName);
  return roomData?.players || [];
};

/**
 * Sauvegarde le nom du joueur actuel
 * @param playerName - Le nom du joueur
 */
export const savePlayerName = (playerName: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PLAYER_NAME, playerName);
    console.log('Nom de joueur sauvegardé:', playerName);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du nom de joueur:', error);
  }
};

/**
 * Récupère le nom du joueur actuel
 * @returns Le nom du joueur ou null
 */
export const getPlayerName = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.PLAYER_NAME);
  } catch (error) {
    console.error('Erreur lors de la récupération du nom de joueur:', error);
    return null;
  }
};

/**
 * Met à jour l'état d'une room dans le localStorage
 * @param roomName - Le nom de la room
 * @param newState - Le nouvel état de la room
 */
export const updateRoomState = (roomName: string, newState: 'waiting' | 'in-game' | 'finished'): void => {
  const roomData = getRoomFromLocalStorage(roomName);
  if (roomData) {
    roomData.state = newState;
    saveRoomToLocalStorage(roomData);
    console.log('État de la room mis à jour:', { roomName, newState });
  }
};

/**
 * Vérifie si un joueur est présent dans la room
 * @param playerName - Le nom du joueur à vérifier
 * @param roomName - Le nom de la room (optionnel, utilise la room courante par défaut)
 * @returns true si le joueur est présent, false sinon
 */
export const hasPlayerInRoom = (playerName: string, roomName?: string): boolean => {
  const players = getPlayersFromLocalStorage(roomName);
  return players.some(player => player.name === playerName);
};

/**
 * Obtient le nombre de joueurs dans la room
 * @param roomName - Le nom de la room (optionnel, utilise la room courante par défaut)
 * @returns Le nombre de joueurs
 */
export const getPlayerCount = (roomName?: string): number => {
  const players = getPlayersFromLocalStorage(roomName);
  return players.length;
};
