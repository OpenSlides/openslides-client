/**
 * Simply type to describe something could pass just a value or a function, which returns the value.
 */
export type Functionable<T> = T | (() => T | Promise<T>);
