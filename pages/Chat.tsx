
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Send, Search, MessageCircle, ArrowLeft } from 'lucide-react';
import { User } from '../types';
import { useLocation } from 'react-router-dom';

export const Chat = () => {
  const { user, users, messages, sendMessage, markMessageRead, t } = useStore();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Handle navigation from profile
  useEffect(() => {
      if (location.state && (location.state as any).startChatWith) {
          const targetId = (location.state as any).startChatWith;
          const targetUser = users.find(u => u.id === targetId);
          if (targetUser) {
              setSelectedUser(targetUser);
              window.history.replaceState({}, document.title);
          }
      }
  }, [location.state, users]);

  // Scroll logic
  const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior: behavior
        });
    }
  };

  // Scroll on new messages or user switch
  useLayoutEffect(() => {
    scrollToBottom('auto'); 
    if (selectedUser) {
        markMessageRead(selectedUser.id);
    }
  }, [messages, selectedUser]);

  const handleSend = () => {
    if (!selectedUser || !messageText.trim()) return;
    sendMessage(selectedUser.id, messageText);
    setMessageText('');
  };

  // Filter users
  const contactList = users.filter(u => 
    u.id !== user?.id && 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !u.isBanned
  );

  // Get conversation
  const currentMessages = messages.filter(m => 
    (m.senderId === user?.id && m.receiverId === selectedUser?.id) ||
    (m.senderId === selectedUser?.id && m.receiverId === user?.id)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    // Fixed height container calculated to fit exactly within the Layout's content area
    // z-0 ensures it doesn't overlap the fixed bottom nav
    <div className="flex h-[calc(100dvh-130px)] md:h-[calc(100vh-100px)] bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden relative z-0">
      
      {/* 
        LEFT COLUMN (Contact List) 
        - On Mobile: Hidden if a user is selected
        - On Desktop: Always visible (w-80)
      */}
      <div className={`w-full md:w-80 bg-gray-50 border-r border-gray-100 flex flex-col ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-100 shrink-0">
          <h2 className="text-xl font-bold text-gray-800 mb-3">{t('messages')}</h2>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-gray-200 focus:outline-none focus:border-brand-400 text-sm text-gray-900"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {contactList.map(u => {
            const unreadCount = messages.filter(m => m.senderId === u.id && m.receiverId === user?.id && !m.isRead).length;
            return (
              <div 
                key={u.id}
                onClick={() => setSelectedUser(u)}
                className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-white transition-colors border-b border-gray-50 ${selectedUser?.id === u.id ? 'bg-white border-l-4 border-l-brand-500 shadow-sm' : ''}`}
              >
                <img src={u.avatar} alt={u.name} className="w-12 h-12 rounded-full border border-gray-200 shrink-0 object-cover" />
                <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-center">
                      <h4 className={`font-bold truncate text-sm ${selectedUser?.id === u.id ? 'text-brand-700' : 'text-gray-800'}`}>{u.name}</h4>
                      {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-sm">{unreadCount}</span>}
                   </div>
                   <p className="text-xs text-gray-500 uppercase font-semibold mt-0.5">{t(u.role.toLowerCase() as any)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 
        RIGHT COLUMN (Chat View)
        - On Mobile: Hidden if NO user selected
        - On Desktop: Always visible (flex-1)
      */}
      <div className={`flex-1 flex flex-col bg-white min-w-0 ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-3 md:p-4 border-b border-gray-100 flex items-center gap-3 bg-white shadow-sm z-10 shrink-0">
              <button 
                onClick={() => setSelectedUser(null)} 
                className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <img src={selectedUser.avatar} className="w-10 h-10 rounded-full border border-gray-100 object-cover" />
              <div>
                <h3 className="font-bold text-gray-800 text-sm md:text-base">{selectedUser.name}</h3>
                <span className="text-xs text-green-500 font-bold flex items-center gap-1">● Online</span>
              </div>
            </div>

            {/* Messages Area */}
            <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30 scroll-smooth custom-scrollbar"
            >
              {currentMessages.map(m => {
                const isMe = m.senderId === user?.id;
                return (
                  <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                    <div className={`max-w-[85%] md:max-w-[70%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      isMe 
                        ? 'bg-brand-500 text-white rounded-br-none' 
                        : 'bg-white text-gray-700 rounded-bl-none border border-gray-200'
                    }`}>
                      <p>{m.content}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isMe ? 'text-brand-100' : 'text-gray-400'}`}>
                          <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isMe && (
                              <span className="opacity-80 font-bold">{m.isRead ? '✓✓' : '✓'}</span>
                          )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Area */}
            <div className="p-3 md:p-4 bg-white border-t border-gray-100 shrink-0 pb-safe">
               <div className="flex items-center gap-2">
                 <input 
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={t('type_message')}
                    className="flex-1 bg-gray-100 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all text-gray-900 placeholder-gray-500 font-medium"
                 />
                 <button 
                    onClick={handleSend}
                    disabled={!messageText.trim()}
                    className="bg-brand-500 text-white p-3 rounded-xl hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-200 active:scale-95"
                 >
                    <Send size={20} />
                 </button>
               </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 bg-gray-50/30">
             <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
                <MessageCircle size={40} className="text-gray-300" />
             </div>
             <p className="text-lg font-bold text-gray-600">{t('chat_with')} someone!</p>
             <p className="text-sm text-gray-400 mt-2 text-center max-w-xs">Select a contact from the left to start a conversation.</p>
          </div>
        )}
      </div>
    </div>
  );
};
