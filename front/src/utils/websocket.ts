import { WebSocketResponseMessage, WebSocketMessage } from "@/types/websocket";

// Utilitaire pour gérer les communications WebSocket avec le serveur
const WEBSOCKET_URL = 'ws://10.87.205.20:8080';

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
const getWebSocketConnection = (): Promise<WebSocket> => {
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
        } else {
          // Sinon, ajouter à la queue
          messageQueue.push(message);
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
  if (response.messageType === 'error')
    return false
  return true
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
