declare module 'lzwcompress' {
  class lzwCompress {
    static pack(data: any): string;
    static unpack(data: string): any;
  }
  export default lzwCompress;
}

declare module 'react-game-engine' {

  import CSS from 'csstype';
  import React from 'react';

  interface DefaultRendererOptions {
    entities: any[];
    window: Window;
  }

  export function DefaultRenderer(defaultRendererOptions: DefaultRendererOptions): any;

  export class DefaultTimer {
    subscribe(callback: (time: number) => undefined): undefined;
    unsubscribe(callback: (time: number) => undefined): undefined;
    start(): undefined;
    stop(): undefined;
    loop(time: number): undefined;
  }

  export interface TimeUpdate {
    current: number;
    delta: number;
    previous: number;
    previousDelta: number;
  }

  export interface GameEngineUpdateEventOptionType {
    dispatch: (event: any) => void;
    events: Array<any>;
    window: Window;
    time: TimeUpdate;
    defer: any;
    input: GameDomEvent[];
  }

  export type GameEngineSystem = (entities: any, update: GameEngineUpdateEventOptionType) => any;

  export interface GameEngineProperties {
    systems?: any[];
    entities?: {} | Promise<any>;
    renderer?: any;
    touchProcessor?: any;
    timer?: any;
    running?: boolean;
    onEvent?: any;
    style?: CSS.Properties;
    children?: React.ReactNode;
  }

  export class GameEngine extends React.Component<GameEngineProperties> {}

  type DomEventName = 'onClick' | 'onContextMenu' | 'onDoubleClick' | 'onDrag' | 'onDragEnd' | 'onDragEnter' | 'onDragExit' | 'onDragLeave' | 'onDragOver' | 'onDragStart' | 'onDrop' | 'onMouseDown' | 'onMouseEnter' | 'onMouseLeave' | 'onMouseMove' | 'onMouseOut' | 'onMouseOver' | 'onMouseUp' | 'onWheel' | 'onTouchCancel' | 'onTouchEnd' | 'onTouchMove' | 'onTouchStart' | 'onKeyDown' | 'onKeyPress' | 'onKeyUp';

  export interface GameDomEvent {
    name: DomEventName;
    payload: MouseEvent|KeyboardEvent|TouchEvent;
  }

  interface GameLoopUpdateEventOptionType {
    input: GameDomEvent[];
    window: Window;
    time: TimeUpdate;
  }

  export interface GameLoopProperties {
    touchProcessor?: any;
    timer?: any;
    running?: boolean;
    onUpdate?: (args: GameLoopUpdateEventOptionType) => void;
    window?: Window;
    children?: React.ReactNode;
  }

  export class GameLoop extends React.Component<GameLoopProperties> {}
}

declare const regeneratorRuntime: any;
