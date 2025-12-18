import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, Card, Space, Tag, Spin } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import { ChatMessage, FrontendAction } from '../types';
import { chatService } from '../services/chatService';

interface ChatPanelProps {
  onFrontendAction?: (action: FrontendAction) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ onFrontendAction }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>();
  const [options, setOptions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userId = 'user-123'; // 固定用户ID

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const newConversationId = await chatService.sendMessage(
        messageText,
        userId,
        conversationId,
        (response) => {
          const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: response.mainMessage,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, assistantMessage]);

          if (response.frontend_actions) {
            response.frontend_actions.forEach(action => {
              if (action.method === 'showOptions') {
                setOptions(action.params.options || []);
              }
              onFrontendAction?.(action);
            });
          }
        },
        (event) => {
          if (event.type === 'start' && event.conversation_id) {
            setConversationId(event.conversation_id);
          }
        }
      );

      if (newConversationId) {
        setConversationId(newConversationId);
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: '抱歉，发送消息时出现错误。请稍后重试。',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionClick = (option: string) => {
    handleSendMessage(option);
    setOptions([]);
  };

  return (
    <div style={{
      width: '400px',
      height: '100%',
      backgroundColor: '#2a2a2a',
      display: 'flex',
      flexDirection: 'column',
      borderLeft: '1px solid #444'
    }}>
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #444',
        backgroundColor: '#333'
      }}>
        <h2 style={{ margin: 0, color: 'white', fontSize: '18px' }}>3D 建模助手</h2>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
      }}>
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: message.role === 'user' ? '#0066cc' : '#444',
              color: 'white',
              alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              wordWrap: 'break-word'
            }}
          >
            {message.content}
          </div>
        ))}

        {options.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionClick(option)}
                style={{
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #666',
                  backgroundColor: '#555',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#666'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#555'}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {isLoading && (
          <div style={{
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: '#444',
            color: '#ccc',
            alignSelf: 'flex-start',
            maxWidth: '80%'
          }}>
            正在处理...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div style={{
        padding: '20px',
        borderTop: '1px solid #444',
        backgroundColor: '#333'
      }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(input)}
            placeholder="输入消息..."
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #666',
              backgroundColor: '#555',
              color: 'white',
              outline: 'none'
            }}
          />
          <button
            onClick={() => handleSendMessage(input)}
            disabled={isLoading || !input.trim()}
            style={{
              padding: '10px 20px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#0066cc',
              color: 'white',
              cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
              opacity: isLoading || !input.trim() ? 0.5 : 1
            }}
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
};