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

    // 初始化 WebSocket 连接
    wsService.connect().then(() => {
      console.log('WebSocket 连接已建立');
    }).catch(error => {
      console.error('WebSocket 连接失败:', error);
    });

    // 监听画线消息
    wsService.on('drawLine', (data: any) => {
      console.log('收到画线消息:', data);
      console.log(scene3DRef.current)
      if (scene3DRef.current) {
        scene3DRef.current.drawLine(data.startPoint, data.endPoint);
      }
    });
  }, []);

  const handleFrontendAction = (action: FrontendAction) => {
    console.log('前端操作:', action);

    switch (action.method) {
      case 'executeTask':
        console.log('执行任务:', action.params.option);
        // 这里可以添加具体的 3D 操作逻辑
        break;
      case 'showOptions':
        console.log('显示选项:', action.params.options);
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
