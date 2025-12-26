import React from 'react';
import {Canvas} from '@react-three/fiber';
import {Grid, OrbitControls} from '@react-three/drei';

interface Scene3DProps {
  onExecuteTask?: (option: string) => void;
}


export const Scene3D: React.FC<Scene3DProps> = ({onExecuteTask}) => {
  return (
    <div style={{width: '100%', height: '100%'}}>
      <Canvas camera={{position: [5, 5, 5], fov: 60}}>
        <ambientLight intensity={0.5}/>
        <pointLight position={[10, 10, 10]}/>

        <Grid
          args={[10, 10]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#6f6f6f"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#9d4b4b"
          fadeDistance={25}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={true}
        />

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={20}
        />
      </Canvas>
    </div>
  );
};
