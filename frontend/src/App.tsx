import React from 'react';
import { Scene3D } from './components/Scene3D';
import { ChatPanel } from './components/ChatPanel';
import { FrontendAction } from './types';

function App() {
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
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      backgroundColor: '#1a1a1a'
    }}>
      <div style={{ flex: 1, height: '100%' }}>
        <Scene3D onExecuteTask={(option) => console.log('执行任务:', option)} />
      </div>
      <ChatPanel onFrontendAction={handleFrontendAction} />
    </div>
  );
}

export default App;