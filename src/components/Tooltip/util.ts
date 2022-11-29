export const getPropertiesObj = (object: any, tooltipType: string, id: string) => {
  if ('properties' in object) {
    return {
      properties: object.properties,
      labels: Object.keys(object.properties),
      tooltipType: tooltipType,
      id: id,
    };
  }

  return {
    properties: object,
    labels: Object.keys(object),
    tooltipType: tooltipType,
    id: id,
  };
};
