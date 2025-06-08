import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.content }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.response
        }]);
      } else {
        throw new Error(data.error || 'Error al procesar el mensaje');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Lo siento, hubo un error al procesar tu mensaje.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-2/3 flex-1 overflow-y-auto px-5 py-5 flex flex-col justify-between gap-5 shadow-sm rounded-lg bg-white">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 p-3 rounded-lg ${
              message.role === 'user' 
                ? 'bg-[#7806F1] text-white ml-auto' 
                : 'bg-gray-100 text-gray-800'
            } max-w-[80%]`}
          >
            {message.content}
          </div>
        ))}
        {isLoading && (
          <div className="mb-4 p-3 rounded-lg bg-gray-100 text-gray-800 max-w-[80%]">
            Escribiendo...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="flex justify-between gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Escribe tu mensaje aquí..."
          className="flex-1 p-2 border border-[#ddd] rounded-lg focus:outline-1 outline-[#7806F1]"
          disabled={isLoading}
        />
        <button 
          type="submit"
          disabled={isLoading}
          className="hover:cursor-pointer transition-all duration-150 active:scale-95 disabled:opacity-50"
        >
          <img
            src="/send-icon.svg"
            alt="Icono de enviar"
            className="w-10 h-10"
          />
        </button>
      </form>
    </div>
  );
} 