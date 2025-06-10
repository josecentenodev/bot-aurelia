import { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { useConversation } from '../hooks/useConversation';
import FeedbackModal from './FeedbackModal';

export default function Chat() {
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isFeedbackPositive, setIsFeedbackPositive] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const openFeedbackModal = (message: Message, isPositive: boolean) => {
    setSelectedMessage(message);
    setIsFeedbackModalOpen(true);
    setIsFeedbackPositive(isPositive);
  }
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, setMessages, conversationId, isLoading, setIsLoading, handleNewChat } = useConversation();


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || !conversationId) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    handleNewChat(userMessage);
  };

  return (
    <>
    <div className="h-[600px] flex-1 overflow-y-auto px-5 py-5 flex flex-col justify-between gap-5 shadow-sm rounded-lg bg-white">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`relative text-md mb-4 p-5 rounded-t-lg ${message.role === 'user'
              ? 'bg-[#7806F1] text-white ml-auto rounded-bl-lg'
              : 'bg-gray-100 text-gray-800 rounded-br-lg'
              } max-w-[60%] min-h-20`}
          >
            <div className='flex align-center gap-3'>
              <p className='flex-1'>{message.content}</p>
              {message.role === 'assistant' && (
                <div className='flex gap-5 align-center'>
                  <button onClick={() => openFeedbackModal(message, true)} className='hover:cursor-pointer transition-all duration-150 active:scale-95'>
                    <img src='/thumb-up-svgrepo-com.svg' height={19} width={19} />
                  </button>
                  <button onClick={() => openFeedbackModal(message, true)} className='hover:cursor-pointer transition-all duration-150 active:scale-95'>
                    <img src='/thumb-down-svgrepo-com.svg' height={19} width={19} />
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-col items-end pt-5">
              <span className={`text-sm ${message.role === 'user' ? 'text-white' : 'text-gray-500'}`}>
                {new Date(message.hora || Date.now()).toLocaleTimeString([], {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <span
              className={`
              absolute
              bottom-0
              ${message.role === 'user'
                  ? 'right-[-10px] border-l-[10px] border-l-[#7806F1] border-t-[10px] border-t-transparent'
                  : 'left-[-10px] border-r-[10px] border-r-gray-100 border-t-[10px] border-t-transparent'
                }
              w-0 h-0
              `}
              style={{
                borderBottom: 'none',
                borderTopStyle: 'solid',
                borderLeftStyle: message.role === 'user' ? 'solid' : 'none',
                borderRightStyle: message.role !== 'user' ? 'solid' : 'none',
              }}
            />
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
      {isFeedbackModalOpen && selectedMessage && (
        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          isPositive={isFeedbackPositive}
          message={selectedMessage}
          onClose={() => setIsFeedbackModalOpen(false)}
        />
      )}
      </>
  );
} 