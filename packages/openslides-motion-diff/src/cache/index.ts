import * as HtmlDiff from "../diff";
import * as LineNumbering from "../line-numbering";
import { djb2hash } from "../utils/utils";

type CacheMap = Record<string, Map<any, any>>;

export function applyCaching(
  ln: typeof LineNumbering,
  diff: typeof HtmlDiff,
): [typeof LineNumbering, typeof HtmlDiff] {
  const cacheMap: CacheMap = {};

  ln.getRange = addCaching(cacheMap, ln.getRange, (html: string) => {
    return djb2hash(html);
  });

  diff.diff = addCaching(
    cacheMap,
    diff.diff,
    (
      htmlOld: string,
      htmlNew: string,
      lineLength: number | null = null,
      firstLineNumber: number | null = null,
    ) => {
      return (
        lineLength +
        ` ` +
        firstLineNumber +
        ` ` +
        djb2hash(htmlOld) +
        djb2hash(htmlNew)
      );
    },
  );

  diff.detectAffectedLineRange = addCaching(
    cacheMap,
    diff.detectAffectedLineRange,
    (html: string) => {
      return djb2hash(html);
    },
  );

  return [ln, diff];
}

function addCaching<A extends any[], T extends (...args: A) => any>(
  cache: CacheMap,
  fn: T,
  createKey: (...args: A) => string | number,
): T {
  return ((...params: any) => {
    const cacheKey = createKey(...params);
    if (!cache[fn.name]) {
      cache[fn.name] = new Map();
    }

    if (!cache[fn.name].has(cacheKey)) {
      cache[fn.name].set(cacheKey, fn(...params));
    }

    return cache[fn.name].get(cacheKey);
  }) as unknown as T;
}
