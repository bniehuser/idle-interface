import { MapPoint } from './map';

export interface Place {
  id: number;
  name: string;
  location: MapPoint;
}
