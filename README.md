O Master Chef Bot é um chatbot em tempo real construído com Flask, Socket.IO e a API Gemini (Google GenAI). Seu objetivo é oferecer uma experiência de culinária interativa, onde o assistente de IA assume a personalidade de um Master Chef rigoroso, inspirada em grandes nomes como Gordon Ramsay e Erick Jacquin.

O bot não apenas fornece receitas claras e diretas, mas também garante uma comunicação dinâmica através de WebSockets e uma formatação impecável de Markdown no Front-end.

Funcionalidades Principais:
  Personalidade Forte: O bot mantém a persona de Master Chef (firme, objetivo e, às vezes, um pouco rude), graças às instruções de sistema (System Instruction) da API Gemini.
  
  Chat em Tempo Real: Utiliza Flask-SocketIO para comunicação bidirecional instantânea entre o servidor e o cliente.
  
  Gerenciamento de Sessão: Cada usuário possui uma sessão de chat persistente e única, garantida por IDs de sessão (uuid4) e gerenciamento de contexto no lado do servidor.
  
  Formatação de Markdown: Utiliza a biblioteca JavaScript marked.js no cliente para renderizar receitas e listas de ingredientes de forma limpa e organizada.
