// 电路元件工具

function createComponent(type: string, properties: any) {
  const componentId = `comp_${Date.now()}`;
  
  console.log(`[元件] 创建${type}元件:`, properties);
  
  let processedProperties;
  switch (type) {
    case '电阻':
    case 'resistor':
      processedProperties = {
        resistance: properties.resistance || '1kΩ',
        power: properties.power || '0.25W',
        tolerance: properties.tolerance || '5%'
      };
      break;
    case '电容':
    case 'capacitor':
      processedProperties = {
        capacitance: properties.capacitance || '100μF',
        voltage: properties.voltage || '25V',
        type: properties.type || 'ceramic'
      };
      break;
    case '电感':
    case 'inductor':
      processedProperties = {
        inductance: properties.inductance || '1mH',
        current: properties.current || '1A',
        tolerance: properties.tolerance || '10%'
      };
      break;
    default:
      processedProperties = properties;
  }

  return {
    success: true,
    componentId,
    type,
    properties: processedProperties
  };
}

export { createComponent };