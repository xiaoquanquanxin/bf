import React, {forwardRef, useImperativeHandle, useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {Grid, OrbitControls} from '@react-three/drei';
import * as THREE from 'three';

interface Scene3DProps {
  onExecuteTask?: (option: string) => void;
}

interface Scene3DRef {
  drawLine: (startPoint: number[], endPoint: number[]) => void;
}

interface LineData {
  id: string;
  startPoint: number[];
  endPoint: number[];
}

const LineComponent: React.FC<{line: LineData}> = ({line}) => {
  const points = [
    new THREE.Vector3(line.startPoint[0], line.startPoint[1], line.startPoint[2]),
    new THREE.Vector3(line.endPoint[0], line.endPoint[1], line.endPoint[2])
  ];
  
  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#ff0000" linewidth={2} />
    </line>
  );
};

export const Scene3D = forwardRef<Scene3DRef, Scene3DProps>(({onExecuteTask}, ref) => {
  const [lines, setLines] = useState<LineData[]>([]);

  useImperativeHandle(ref, () => ({
    drawLine: (startPoint: number[], endPoint: number[]) => {
      console.log('Scene3D.drawLine 被调用:', {startPoint, endPoint});
      const newLine: LineData = {
        id: `line_${Date.now()}_${Math.random()}`,
        startPoint,
        endPoint
      };
      setLines(prev => [...prev, newLine]);
    }
  }));

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

        {lines.map(line => (
          <LineComponent key={line.id} line={line} />
        ))}

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
});
