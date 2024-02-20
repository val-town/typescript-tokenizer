import Parser from "tree-sitter";
import natural from "natural";
import TreeSitterTypeScript from "tree-sitter-typescript";
import { stopwords } from "./stopwords.mjs";

// supercalifragilisticexpialidocious is 34 characters
// long and is very long. we probably don't need
// 32-char words anyway. But regardless, this might help.
const MAX_WORD_LENGTH = 32;
const englishTokenizer = new natural.AggressiveTokenizer();

const parser = new Parser();
parser.setLanguage(TreeSitterTypeScript.tsx);

const query = new Parser.Query(
  TreeSitterTypeScript.tsx,
  `
(identifier) @element
(type_identifier) @element
(property_identifier) @element
(shorthand_property_identifier_pattern) @element
(string_fragment) @element
(comment) @element
`,
);

// Keep this in sync with the compound query above
const patterns = [
  { name: "identifier" },
  { name: "type_identifier" },
  { name: "property_identifier" },
  { name: "shorthand_property_identifier_pattern" },
  { name: "string_fragment", english: true },
  { name: "comment", english: true },
];

/**
 * @param {String} ts
 */
export function tokenize(ts) {
  const tree = parser.parse(ts);
  const matches = query.matches(tree.rootNode);

  let tokens = [];

  for (let m of matches) {
    const pat = patterns[m.pattern];
    for (let c of m.captures) {
      if (pat.english) {
        /**
         * @type string
         */
        const text = tree.getText(c.node);

        // index urls directly?
        // if (text.startsWith("http")) {
        //   tokens.push([text, c.node.startIndex]);
        //   continue;
        // }

        const words = englishTokenizer.tokenize(text.replaceAll(/[\/\\]/g, ""));

        // Natural doesn't expose indices, so just
        // put these right next to each other to make Postgres
        // proximity matching work.
        // https://github.com/NaturalNode/natural/issues/443
        let i = 0;
        for (const word of words) {
          let stemmed = natural.PorterStemmer.stem(word);
          if (stopwords.has(stemmed)) continue;
          if (stemmed.length > MAX_WORD_LENGTH) continue;
          tokens.push([stemmed, c.node.startIndex + i]);
          i++;
        }
      } else {
        const text = tree.getText(c.node);
        if (text.length > MAX_WORD_LENGTH) continue;
        tokens.push([text, c.node.startIndex]);
      }
    }
  }

  return tokens;
}
