import {ChatMessage, FrontendAction} from '../types';
import React, {useEffect, useRef, useState} from 'react';
import {RobotOutlined, SendOutlined, UserOutlined} from '@ant-design/icons';
import {Button, Card, Input, Space, Spin} from 'antd';
import {chatService} from '../services/chatService';

interface ChatPanelProps {
  onFrontendAction?: (action: FrontendAction) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({onFrontendAction}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const [options, setOptions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userId = 'user-123'; // 固定用户ID

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
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
      const response = await chatService.sendMessage(messageText, userId, conversationId);

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);

      if (response.conversationId) {
        setConversationId(response.conversationId);
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
    <Card
      title={<><RobotOutlined/> 3D 建模助手</>}
      bodyStyle={{flex: 1, display: 'flex', flexDirection: 'column', padding: 0}}
    >
      <div className="messages-area" style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <Card
              size="small"
              style={{
                maxWidth: '80%',
                backgroundColor: message.role === 'user' ? '#1890ff' : '#f5f5f5'
              }}
              bodyStyle={{padding: '8px 12px'}}
            >
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                {message.role === 'user' ? <UserOutlined/> : <RobotOutlined/>}
                <span>{message.content}</span>
              </div>
            </Card>
          </div>
        ))}

        {options.length > 0 && (
          <Space direction="vertical" size="small">
            {options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleOptionClick(option)}
                block
                type="dashed"
              >
                {option}
              </Button>
            ))}
          </Space>
        )}

        {isLoading && (
          <div style={{display: 'flex', justifyContent: 'flex-start'}}>
            <Card size="small" style={{backgroundColor: '#f5f5f5'}}>
              <Spin size="small"/> 正在处理...
            </Card>
          </div>
        )}

        <div ref={messagesEndRef}/>
      </div>

      <div style={{padding: '16px', borderTop: '1px solid #f0f0f0'}}>
        <Input.Group compact>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPressEnter={() => handleSendMessage(input)}
            placeholder="输入消息..."
            disabled={isLoading}
            style={{width: 'calc(100% - 80px)'}}
          />
          <Button
            type="primary"
            icon={<SendOutlined/>}
            onClick={() => handleSendMessage(input)}
            disabled={isLoading || !input.trim()}
            style={{width: '80px'}}
          >
            发送
          </Button>
        </Input.Group>
      </div>
    </Card>
  );
};
