import * as LineNumbering from "../../line-numbering";
import * as HtmlDiff from "../../diff";

export function applyV1_0_0(ln: typeof LineNumbering, _diff: typeof HtmlDiff) {
  const originalLnInsert = ln.insert;
  ln.insert = function (input): string {
    input.html = input.html?.replace(/<br>(<br>)+/gm, (match) => {
      return `<br><span class="spacer" data-lines="${match.length / 4}" style="display:block; margin-bottom: ${(match.length / 4) * 19}px"></span>`;
    });

    return originalLnInsert(input);
  };
}
