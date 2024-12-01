// Cache implementation remains the same as before
type CacheKey = string;
type CacheValue = any;

interface CacheOptions {
  maxSize?: number;
  ttl?: number;
}

class Cache {
  private cache: Map<CacheKey, { value: CacheValue; timestamp: number }>;
  private maxSize: number;
  private ttl: number;

  constructor(options: CacheOptions = {}) {
    this.cache = new Map();
    this.maxSize = options.maxSize || 1000;
    this.ttl = options.ttl || 0;
  }

  set(key: CacheKey, value: CacheValue): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  get(key: CacheKey): CacheValue | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) return undefined;

    if (this.ttl > 0 && Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  clear(): void {
    this.cache.clear();
  }
}

// Function decorator for standalone functions
export function cacheable(options: CacheOptions = {
    maxSize: 10000,
    ttl: 1000 * 60 * 5
}) {
  const cache = new Cache(options);

  return function <T extends Function>(
    target: T
  ): T {
    // Create a new function wrapper that handles caching
    const cachedFunction = function (this: any, ...args: any[]) {
      const cacheKey = `standalone-${target.name}-${JSON.stringify(args)}`;
      const cachedValue = cache.get(cacheKey);

      if (cachedValue !== undefined) {
        return cachedValue;
      }

      const result = target.apply(this, args);

      // Handle promises
      if (result instanceof Promise) {
        return result.then((value: any) => {
          cache.set(cacheKey, value);
          return value;
        });
      }

      cache.set(cacheKey, result);
      return result;
    };

    // Copy over properties of the original function
    Object.defineProperty(cachedFunction, 'name', { value: target.name });
    return cachedFunction as unknown as T;
  };
}

// Method decorator (for class methods) remains the same
export function Cached(options: CacheOptions = {}) {
  const cache = new Cache(options);

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const cacheKey = `${target.constructor.name}-${propertyKey}-${JSON.stringify(args)}`;
      const cachedValue = cache.get(cacheKey);

      if (cachedValue !== undefined) {
        return cachedValue;
      }

      const result = originalMethod.apply(this, args);

      if (result instanceof Promise) {
        return result.then((value: any) => {
          cache.set(cacheKey, value);
          return value;
        });
      }

      cache.set(cacheKey, result);
      return result;
    };

    return descriptor;
  };
}