// 场景对象类型定义

export type ObjectType = 'point' | 'line' | 'plane' | 'volume';

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface SceneObject {
  id: string;
  type: ObjectType;
  createdAt: number;
  data: PointData | LineData | PlaneData | VolumeData;
}

export interface PointData {
  position: Point3D;
}

export interface LineData {
  startPoint: Point3D;
  endPoint: Point3D;
  length: number;
}

export interface PlaneData {
  vertices: Point3D[];  // 平面的顶点
  normal?: Point3D;     // 法向量
  area?: number;        // 面积
}

export interface VolumeData {
  volumeType: 'cube' | 'sphere' | 'cylinder' | 'custom';
  vertices?: Point3D[];
  center?: Point3D;
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
    radius?: number;
  };
  volume?: number;
}

export interface InventorySummary {
  totalCount: number;
  byType: {
    point: number;
    line: number;
    plane: number;
    volume: number;
  };
  objects: SceneObject[];
}
