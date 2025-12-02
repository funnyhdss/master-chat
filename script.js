document.addEventListener('DOMContentLoaded', () => {
    let socket = null;

    const chatBox = document.getElementById('chat-box');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const connectionStatus = document.getElementById('connection-status');
    const iniciarBtn = document.getElementById('iniciarBtn');
    const encerrarBtn = document.getElementById('encerrarBtn');

    let userSessionId = null;

    // Função para adicionar mensagens no chat
    function addMessageToChat(sender, text, type = 'normal') {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');

        if (sender.toLowerCase() === 'user') {
            messageElement.classList.add('user-message');
            sender = 'Você';
        } else if (sender.toLowerCase() === 'bot') {
            messageElement.classList.add('bot-message');
            sender = 'Ramsay'; // Ou 'Chef' ou 'Jacquin', como preferir!
        } else {
            messageElement.classList.add('status-message');
        }

        if (type === 'error') {
            messageElement.classList.add('error-text');
            sender = 'Erro';
        } else if (type === 'status') {
            messageElement.classList.add('status-text');
            sender = 'Status';
        }

        const senderSpan = document.createElement('strong');
        senderSpan.textContent = `${sender}: `;
        messageElement.appendChild(senderSpan);
        
        const textSpan = document.createElement('span');
        // AQUI ESTÁ A MÁGICA: Use marked.parse() para converter Markdown em HTML
        // Isso cuidará dos *negritos*, ##cabeçalhos, -listas, etc.
        textSpan.innerHTML = marked.parse(text); 
        messageElement.appendChild(textSpan);
        
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Função para habilitar/desabilitar os controles de input do chat
    function setChatEnabled(enabled) {
        messageInput.disabled = !enabled;
        sendButton.disabled = !enabled;
    }

    // Estado inicial: chat desabilitado e status de desconexão
    setChatEnabled(false);
    connectionStatus.textContent = 'Desconectado';
    connectionStatus.className = 'status-offline';
    addMessageToChat('Status', 'Clique em "Iniciar conversa" para começar a cozinhar como um Master Chef.', 'status');

    // Função para iniciar a conexão WebSocket com o servidor
    function iniciarConversa() {
        // Evita múltiplas conexões se já estiver conectado
        if (socket && socket.connected) return;

        // Cria uma nova instância do Socket.IO conectando ao seu servidor Flask
        socket = io('http://127.0.0.1:5000/');

        // Evento 'connect': acionado quando a conexão é estabelecida com sucesso
        socket.on('connect', () => {
            console.log('Conectado ao servidor Socket.IO! SID:', socket.id);
            connectionStatus.textContent = 'Conectado';
            connectionStatus.className = 'status-online';
            addMessageToChat('Status', 'Conectado ao servidor de chat.', 'status');
            setChatEnabled(true); // Habilita o chat após a conexão
        });

        // Evento 'disconnect': acionado quando a conexão é perdida
        socket.on('disconnect', () => {
            console.log('Desconectado do servidor Socket.IO.');
            connectionStatus.textContent = 'Desconectado';
            connectionStatus.className = 'status-offline';
            addMessageToChat('Status', 'Você foi desconectado.', 'status');
            setChatEnabled(false); // Desabilita o chat após a desconexão
        });

        // Evento 'status_conexao': recebe o ID da sessão do servidor (se disponível)
        socket.on('status_conexao', (data) => {
            if (data.session_id) {
                userSessionId = data.session_id;
            }
        });

        // Evento 'nova_mensagem': recebe uma nova mensagem do bot e a adiciona ao chat
        socket.on('nova_mensagem', (data) => {
            addMessageToChat(data.remetente, data.texto);
        });

        // Evento 'erro': recebe mensagens de erro do servidor
        socket.on('erro', (data) => {
            addMessageToChat('Erro', data.erro, 'error');
        });
    }

    // Função para encerrar a conversa (desconectar do WebSocket)
    function encerrarConversa() {
        if (socket && socket.connected) {
            socket.disconnect(); // Solicita a desconexão do servidor
            setChatEnabled(false); // Desabilita o chat
            addMessageToChat('Status', 'Conversa encerrada pelo usuário.', 'status');
        }
    }

    // Função para enviar a mensagem digitada pelo usuário para o servidor
    function sendMessageToServer() {
        const messageText = messageInput.value.trim(); // Remove espaços em branco antes/depois
        if (messageText === '') return; // Não envia mensagens vazias

        if (socket && socket.connected) {
            addMessageToChat('user', messageText); // Adiciona a mensagem do usuário ao chat
            socket.emit('enviar_mensagem', { mensagem: messageText }); // Envia para o servidor
            messageInput.value = ''; // Limpa o campo de input
            messageInput.focus(); // Coloca o foco de volta no campo de input
        } else {
            addMessageToChat('Erro', 'Não conectado ao servidor. Clique em "Iniciar conversa".', 'error');
        }
    }

    // Associa as funções aos eventos de clique dos botões
    iniciarBtn.addEventListener('click', iniciarConversa);
    encerrarBtn.addEventListener('click', encerrarConversa);
    sendButton.addEventListener('click', sendMessageToServer);

    // Permite enviar mensagem pressionando 'Enter' no campo de input
    messageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendMessageToServer();
        }
    });
});