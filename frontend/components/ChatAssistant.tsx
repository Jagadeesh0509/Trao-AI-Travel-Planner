'use client';

import { useState, useRef, useEffect } from 'react';
import { Trip } from '@/types';
import { tripsApi } from '@/utils/api';

interface ChatAssistantProps {
  trip: Trip;
  onTripUpdated: (updatedTrip: Trip) => void;
}

const QUICK_PROMPTS = [
  { text: '🎒 What should I pack?', value: 'What should I pack for this trip?' },
  { text: '☀️ What is the weather like?', value: 'What is the weather like at this destination?' },
  { text: '🥗 Suggest vegetarian restaurants', value: 'Can you suggest some good vegetarian restaurants here?' },
  { text: '💰 How can I save money?', value: 'How can I optimize my budget and save money on this itinerary?' },
  { text: '🏛️ What are local customs?', value: 'What are the important local customs and etiquettes I should know?' },
  { text: '🚌 What transportation to use?', value: 'What is the best way to get around (public transport, taxi, walking)?' },
];

// Simple markdown formatter helper to display bullet points, bold text, and line breaks nicely
function formatMarkdown(text: string) {
  if (!text) return '';
  
  // Replace newlines with breaks
  let formatted = text;
  
  // Format bold (**text** or __text__)
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Format list items
  formatted = formatted.split('\n').map(line => {
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      return `<li class="ml-4 list-disc my-1 text-slate-300">${line.trim().substring(2)}</li>`;
    }
    return line;
  }).join('\n');
  
  // Format clean line breaks
  formatted = formatted.replace(/\n/g, '<br />');
  
  return <div dangerouslySetInnerHTML={{ __html: formatted }} className="text-slate-300 space-y-1" />;
}

export default function ChatAssistant({ trip, onTripUpdated }: ChatAssistantProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const history = trip.chatHistory || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, isLoading]);

  const handleSend = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    setMessage('');
    setIsLoading(true);

    try {
      const response = await tripsApi.chat(trip._id, trimmed);
      
      // Update parent trip state with the returned new chatHistory
      onTripUpdated({
        ...trip,
        chatHistory: response.chatHistory,
      });
    } catch (err) {
      console.error('Chat failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend(message);
    }
  };

  return (
    <div className="card flex flex-col h-[550px] overflow-hidden" id="chat-assistant-container">
      {/* Chat Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/1">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg text-white">
            🤖
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">AI Travel Assistant</h3>
            <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online & Context Aware (Gemini AI)
            </p>
          </div>
        </div>
      </div>

      {/* Chat Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {history.length === 0 && (
          <div className="text-center py-6 max-w-md mx-auto">
            <div className="text-4xl mb-3 animate-float">💬</div>
            <h4 className="text-sm font-bold text-white mb-2">Ask anything about your trip!</h4>
            <p className="text-xs text-slate-500 mb-6">
              I know your destination ({trip.destination}), planned itinerary, activities, budget tier, and hotels. Try asking one of these:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {QUICK_PROMPTS.map((qp, index) => (
                <button
                  key={index}
                  onClick={() => handleSend(qp.value)}
                  className="p-3 text-left rounded-xl bg-white/3 border border-white/5 hover:border-indigo-500/30 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  {qp.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {history.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={index}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white ${
                  isUser
                    ? 'bg-indigo-600/80 border border-indigo-400/20'
                    : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                }`}
              >
                {isUser ? '👤' : '🤖'}
              </div>

              {/* Message Bubble */}
              <div
                className={`p-3.5 rounded-2xl max-w-[85%] border text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600/15 border-indigo-500/20 text-white rounded-tr-none'
                    : 'bg-white/3 border-white/5 text-slate-200 rounded-tl-none'
                }`}
              >
                {isUser ? (
                  <p className="text-slate-100 font-medium whitespace-pre-wrap">{msg.message}</p>
                ) : (
                  formatMarkdown(msg.message)
                )}
                <div className={`text-[9px] mt-1.5 ${isUser ? 'text-indigo-400' : 'text-slate-500'}`}>
                  {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-xs text-white">
              🤖
            </div>
            <div className="p-3.5 rounded-2xl rounded-tl-none bg-white/3 border border-white/5 text-xs text-slate-400 flex items-center gap-1.5">
              <span>Assistant is crafting an answer</span>
              <span className="flex gap-0.5 mt-1">
                <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Footer Input */}
      <div className="p-3 bg-white/1 border-t border-white/5 flex gap-2">
        <input
          id="chat-assistant-input"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask a question..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl text-sm px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:bg-white/7 transition-all"
          disabled={isLoading}
        />
        <button
          id="chat-assistant-send-btn"
          onClick={() => handleSend(message)}
          disabled={!message.trim() || isLoading}
          className="p-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm transition-all disabled:opacity-40 flex items-center justify-center aspect-square"
          title="Send message"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
