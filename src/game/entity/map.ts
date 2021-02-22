export interface MapPoint {
  x: number;
  y: number;
}

export const distance = (f: MapPoint, t: MapPoint) => {
  const x = t.x - f.x;
  const y = t.y - f.y;
  return Math.sqrt(x * x + y * y);
};
