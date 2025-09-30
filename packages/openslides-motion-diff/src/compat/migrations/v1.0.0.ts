import * as LineNumbering from "../../line-numbering";
import * as HtmlDiff from "../../diff";

export function applyV1_0_0(ln: typeof LineNumbering, _diff: typeof HtmlDiff) {
  const originalLnInsert = ln.insert;
  ln.insert = function(input): string {
    if (/><br>/.test(input.html)) {
      // TODO
    }

    return originalLnInsert(input);
  }
}
