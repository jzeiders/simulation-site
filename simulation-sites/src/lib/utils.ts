import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}




export function pipe<T>(...fns: ((arg: T) => T)[]): (arg: T) => T {
    return (arg: T) => fns.reduce((acc, fn) => fn(acc), arg);
}