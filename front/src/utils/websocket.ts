import { WebSocketResponseMessage, WebSocketMessage } from "@/types/websocket";

// Utilitaire pour gérer les communications WebSocket avec le serveur
const WEBSOCKET_URL = 'ws://10.87.205.20:8080';
//const WEBSOCKET_URL = 'ws://localhost:8080';

// Types pour le localStorage
interface Player {
  name: string;
}

interface RoomData {
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

// Instance globale de WebSocket pour maintenir la connexion
let globalWebSocket: WebSocket | null = null;

// Queue pour stocker les messages entrants
const messageQueue: unknown[] = [];

// Liste des listeners en attente d'un message
const pendingMessageListeners: Array<{
  resolve: (message: unknown) => void;
  reject: (error: Error) => void;
  timeout?: NodeJS.Timeout;
}> = [];

/**
 * Obtient ou crée une connexion WebSocket persistante
 * @returns Promise qui se résout avec l'instance WebSocket
 */
export const getWebSocketConnection = (): Promise<WebSocket> => {
  return new Promise((resolve, reject) => {
    // Si on a déjà une connexion ouverte, on la retourne
    if (globalWebSocket && globalWebSocket.readyState === WebSocket.OPEN) {
      resolve(globalWebSocket);
      return;
    }

    try {
      globalWebSocket = new WebSocket(WEBSOCKET_URL);

      globalWebSocket.onopen = () => {
        console.log('WebSocket connecté au serveur');
        resolve(globalWebSocket!);
      };

      globalWebSocket.onmessage = (event) => {
        console.log('Message reçu du serveur:', event.data);

        let message: WebSocketResponseMessage;
        try {
          message = JSON.parse(event.data);
          console.log('Message parsé:', message);
        } catch {
          message = event.data;
          console.log('Message brut (non-JSON):', message);
        }

        // Si il y a des listeners en attente, donner le message au premier
        if (pendingMessageListeners.length > 0) {
          const listener = pendingMessageListeners.shift()!;
          if (listener.timeout) {
            clearTimeout(listener.timeout);
          }
          listener.resolve(message);
        }
        if (message.messageType === 'join_room' && typeof message.payload === 'object' && message.payload !== null && 'playerName' in message.payload && 'roomName' in message.payload) {
          addPlayerToLocalStorage(message.payload.playerName, message.payload.roomName);
        }
      };

      globalWebSocket.onerror = (error) => {
        console.error('Erreur WebSocket:', error);
        reject(new Error('Erreur de connexion WebSocket - Vérifiez que le serveur est démarré'));
      };

      globalWebSocket.onclose = (event) => {
        console.log('WebSocket fermé:', event.code, event.reason);
        globalWebSocket = null;

        if (event.code !== 1000 && event.code !== 1001) {
          // Auto-reconnexion en cas de fermeture inattendue
          console.log('Tentative de reconnexion...');
          setTimeout(() => {
            getWebSocketConnection().catch(console.error);
          }, 2000);
        }
      };

      // Timeout de sécurité
      setTimeout(() => {
        if (globalWebSocket && globalWebSocket.readyState === WebSocket.CONNECTING) {
          globalWebSocket.close();
          reject(new Error('Timeout de connexion WebSocket - Le serveur ne répond pas'));
        }
      }, 5000);

    } catch (error) {
      console.error('Erreur lors de la création WebSocket:', error);
      reject(new Error('Impossible de créer la connexion WebSocket'));
    }
  });
};

/**
 * Envoie un message via la connexion WebSocket persistante
 * @param message - Le message à envoyer
 * @returns Promise qui se résout quand le message est envoyé
 */
export const sendWebSocketMessage = async (message: WebSocketMessage): Promise<void> => {
  try {
    const ws = await getWebSocketConnection();
    ws.send(JSON.stringify(message));
    console.log('Message envoyé au serveur:', message);
  } catch (error) {
    console.error('Erreur lors de l\'envoi:', error);
    throw error;
  }
};

/**
 * Ferme la connexion WebSocket globale
 */
export const closeWebSocketConnection = (): void => {
  if (globalWebSocket) {
    globalWebSocket.close(1000, 'Fermeture manuelle');
    globalWebSocket = null;
    console.log('Connexion WebSocket fermée manuellement');
  }

  // Nettoyer les listeners en attente
  pendingMessageListeners.forEach(listener => {
    if (listener.timeout) {
      clearTimeout(listener.timeout);
    }
    listener.reject(new Error('Connexion WebSocket fermée'));
  });
  pendingMessageListeners.length = 0;
  messageQueue.length = 0;
};

/**
 * Attend et retourne le prochain message envoyé par le serveur
 * @param timeoutMs - Timeout en millisecondes (défaut: 30000ms = 30s)
 * @returns Promise qui se résout avec le prochain message du serveur
 */
export const getWebSocketMessage = async (timeoutMs: number = 30000): Promise<WebSocketResponseMessage> => {
  // S'assurer que la connexion WebSocket est établie
  await getWebSocketConnection();

  return new Promise<WebSocketResponseMessage>((resolve, reject) => {
    // Si il y a déjà un message dans la queue, le retourner immédiatement
    if (messageQueue.length > 0) {
      const message = messageQueue.shift()!;
      console.log('Message récupéré depuis la queue:', message);
      resolve(message as WebSocketResponseMessage);
      return;
    }

    // Sinon, ajouter un listener en attente
    const timeout = setTimeout(() => {
      // Retirer le listener de la liste
      const index = pendingMessageListeners.findIndex(l => l.resolve === resolve);
      if (index !== -1) {
        pendingMessageListeners.splice(index, 1);
      }
      reject(new Error(`Timeout: Aucun message reçu dans les ${timeoutMs}ms`));
    }, timeoutMs);

    pendingMessageListeners.push({
      resolve: (message: unknown) => {
        console.log('Message reçu en temps réel:', message);
        resolve(message as WebSocketResponseMessage);
      },
      reject,
      timeout
    });

    console.log(`En attente du prochain message du serveur (timeout: ${timeoutMs}ms)...`);
  });
};

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
    console.log('🗂️ Données de room sauvegardées:', dataWithTimestamp);

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
      console.log('🗑️ Données de room trop anciennes, suppression');
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
    console.log('Joueur ajouté à la room:', playerName);
  } else {
    console.log('Joueur déjà présent dans la room:', playerName);
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
    console.warn('Impossible de retirer le joueur: room non trouvée dans localStorage');
    return;
  }

  roomData.players = roomData.players.filter(p => p.name !== playerName);
  saveRoomToLocalStorage(roomData);
  console.log('Joueur retiré de la room:', playerName);
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
 * Envoie un message pour créer une room
 * @param roomName - Le nom de la room à créer
 * @returns Promise qui se résout quand le message est envoyé
 */
export const createRoom = async (roomName: string): Promise<boolean> => {
  const message: WebSocketMessage = {
    messageType: 'create_room',
    payload: {
      roomName: roomName.trim()
    }
  };

  try {
    await sendWebSocketMessage(message);
    console.log('Room créée avec succès:', roomName);
  } catch (error) {
    console.error('Erreur lors de la création de la room:', error);
    throw error;
  }
  const response: WebSocketResponseMessage = await getWebSocketMessage();
  console.log('Message reçu après création de la room:', response);

  if (response.messageType === 'error') {
    return false;
  }

  // Sauvegarder la room créée dans localStorage
  const roomData: RoomData = {
    name: roomName.trim(),
    players: [],
    state: 'waiting',
    lastUpdated: Date.now()
  };
  saveRoomToLocalStorage(roomData);

  return true;
};

/**
 * Envoie un message pour rejoindre une room
 * @param roomName - Le nom de la room à rejoindre
 * @param playerName - Le nom du joueur
 * @returns Promise qui se résout quand le message est envoyé
 */
export const joinRoom = async (roomName: string, playerName: string): Promise<{ success: boolean; response: WebSocketResponseMessage }> => {
  const message: WebSocketMessage = {
    messageType: 'join_room',
    payload: {
      roomName: roomName.trim(),
      playerName: playerName.trim()
    }
  };

  try {
    await sendWebSocketMessage(message);
    console.log('Room rejointe avec succès:', { roomName, playerName });
  } catch (error) {
    console.error('Erreur lors de l\'entrée dans la room:', error);
    throw error;
  }
  const response: WebSocketResponseMessage = await getWebSocketMessage();
  if (response.messageType === 'error')
    return { success: false, response }
  return { success: true, response }
};
