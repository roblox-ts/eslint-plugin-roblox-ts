// Type definitions for Roblox-TS compatibility testing

declare global {
  // Roblox math types
  class Vector3 {
    constructor(x?: number, y?: number, z?: number);
    add(other: Vector3): Vector3;
    X: number;
    Y: number;
    Z: number;
  }

  class Vector2 {
    constructor(x?: number, y?: number);
    add(other: Vector2): Vector2;
    X: number;
    Y: number;
  }

  class CFrame {
    constructor();
    mul(other: CFrame): CFrame;
  }

  // Roblox utility functions
  function pairs<T>(t: T): IterableIterator<[keyof T, T[keyof T]]>;
  function ipairs<T>(t: T[]): IterableIterator<[number, T]>;
  function wait(seconds?: number): void;
  function print(...args: any[]): void;

  // Task library
  namespace task {
    function wait(seconds?: number): void;
    function spawn(fn: () => void): void;
  }

  // Array extensions
  interface Array<T> {
    size(): number;
  }
}

export {};