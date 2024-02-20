# TypeScript Tokenizer

_This is an experimental module! Expect changes and breakage!_

Most search utilities are not prepared for source code. They have lists
of stopwords that are in English, parsers and tokenizers that don't work with
code. This is an attempt at creating a tool to extract useful tokens from
TypeScript source. Right now it works by:

1. Parsing TypeScript with [tree-sitter](https://github.com/tree-sitter/node-tree-sitter) to
   get useful things like identifier names but avoid not-useful things like
   keywords.
2. Feeding the probably-english parts of that AST into [natural](https://naturalnode.github.io/natural/)
   to run a porter/stemmer/stopwords-removal routine on it.
3. Returning this all in a format that is, we hope, friendly for [Postgres’s preferences](https://www.postgresql.org/docs/current/datatype-textsearch.html).
