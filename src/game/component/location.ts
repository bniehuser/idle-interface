import { MapPoint } from '../entity/map';
import { Place } from '../entity/place';

const routeTypes = ['homeToWork', 'homeToHobby'] as const;
export type RouteType = typeof routeTypes[number];

export type Route = Array<MapPoint>;

export interface LocationDetails {
  home: number; // place id
  work: number; // place id
  favoriteSpots: Array<Place|MapPoint>;
  routes: {[T in RouteType]?: Route};
}
