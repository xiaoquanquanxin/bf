// 几何体创建工具

function createBasicGeometry(type: string, dimensions: any) {
  const geometryId = `geo_${Date.now()}`;
  
  console.log(`[几何体] 创建${type}:`, dimensions);
  
  let processedDimensions;
  switch (type) {
    case '立方体':
    case 'cube':
      processedDimensions = {
        width: dimensions.width || 1,
        height: dimensions.height || 1,
        depth: dimensions.depth || 1
      };
      break;
    case '球体':
    case 'sphere':
      processedDimensions = {
        radius: dimensions.radius || 0.5
      };
      break;
    case '圆柱体':
    case 'cylinder':
      processedDimensions = {
        radius: dimensions.radius || 0.5,
        height: dimensions.height || 1
      };
      break;
    default:
      processedDimensions = dimensions;
  }

  return {
    success: true,
    geometryId,
    type,
    dimensions: processedDimensions
  };
}

export { createBasicGeometry };