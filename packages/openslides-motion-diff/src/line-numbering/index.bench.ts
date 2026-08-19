import { LoremIpsum } from "lorem-ipsum";
import { bench } from "vitest";
import { insert } from ".";

const lorem = new LoremIpsum({}, "html");
const html = lorem.generateParagraphs(999);

bench(
  "insert line numbers",
  () => {
    insert({
      html,
      lineLength: 80,
      firstLine: 1,
    });
  },
  { time: 10000 },
);
