import {FrontendAction} from './types';
import React, {useEffect, useRef} from 'react';
import {Scene3D} from './components/Scene3D';
import {ChatPanel} from './components/ChatPanel';
import {wsService} from './services/websocketService';
import 'antd/dist/reset.css';
import './App.css';

interface Scene3DRef {
  drawLine: (startPoint: number[], endPoint: number[]) => void;
}

function App() {
  const scene3DRef = useRef<Scene3DRef>(null);
  const wsInitialized = useRef(false);

  useEffect(() => {
    // 防止重复初始化
    if (wsInitialized.current) {
      return;
    }
    wsInitialized.current = true;

    // 初始化 WebSocket 连接（会自动生成或从 localStorage 加载会话信息）
    wsService.connect().catch(error => {
      console.error('❌ WebSocket 连接失败:', error);
    });

    // 监听画线消息
    wsService.on('drawLine', (data: any) => {
      if (scene3DRef.current) {
        scene3DRef.current.drawLine(data.startPoint, data.endPoint);
      }
    });
  }, []);

  const handleFrontendAction = (action: FrontendAction) => {
    switch (action.method) {
      case 'executeTask':
        // 这里可以添加具体的 3D 操作逻辑
        break;
      case 'showOptions':
        // 选项显示逻辑已在 ChatPanel 中处理
        break;
      default:
        console.log('未知操作:', action.method);
    }
  };

  return (
    <div className="app">
      <div className="left">
        <Scene3D ref={scene3DRef} onExecuteTask={(option) => console.log('执行任务:', option)}/>
      </div>
      <div className="right">
        <ChatPanel onFrontendAction={handleFrontendAction}/>
      </div>
    </div>
  );
}

export default App;
