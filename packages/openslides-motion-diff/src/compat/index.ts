import { applyCaching } from "../cache";
import * as HtmlDiff from "../diff";
import * as LineNumbering from "../line-numbering";
import { applyV1_0_0 } from "./migrations/v1.0.0";

export function getForVersion(v: string): [typeof LineNumbering, typeof HtmlDiff] {
  const migrations: [string, Function][] = [
    [`1.0.0`, applyV1_0_0]
  ];

  const ln = { ...LineNumbering };
  const diff = { ...HtmlDiff };
  diff.useCustomLineNumbering(ln);
  diff.useCustomHtmlDiff(diff);

  for (let m of migrations) {
    if (v.localeCompare(m[0], undefined, { numeric: true, sensitivity: "base" }) < 0) {
      m[1](ln, diff);
    }
  }

  return applyCaching(ln, diff);
}
