const fs = require('fs');
const _ = require('lodash/fp');

// Curried function to read file
const readFile = _.curry(fs.readFileSync)(_, 'utf8');

// Curried funtion to read file
const writeFile = _.curry(fs.writeFileSync)('output.html', _, 'utf8');

// Function to parse a text to a tag using regex
const parseTag = (regex, tag) => (text) =>
  text.replace(regex, `<${tag}>$1</${tag}>`);

const parseBoldAsteriscs = parseTag(/\*\*(.*?)\*\*/gm, 'b');
const parseBoldUnderscores = parseTag(/\_\_(.*?)\_\_/gm, 'b');

const parseItalicAsteriscs = parseTag(/\*(.*?)\*/gm, 'i');
const parseItalicUnderscores = parseTag(/\_(.*?)\_/gm, 'i');

// Parses markdown bold text to html
const parseBolds = (text) =>
  _.flow(parseBoldAsteriscs, parseBoldUnderscores)(text);

// Parses markdown italic text to html
const parseItalics = (text) =>
  _.flow(parseItalicAsteriscs, parseItalicUnderscores)(text);

// Adds line breaks to text
const addLineBreaks = (text) => text.replace(/  $/gm, '<br>');

// Join paragraphs tags
const joinParagraphs = (text) => text.replace(/<\/p><p>/g, '');

// Join blockquotes tags
const joinBlockquotes = (text) =>
  text.replace(/<\/blockquote><blockquote>/g, '<br>');

// Parses markdown headers to html
const parseHeader = (line) => {
  const level = line.split(' ')[0].length;
  const content = line.slice(level).trim();
  return `<h${level}>${content}</h${level}>`;
};

// Parses markdown lists to html
const parseUnorderedList = (line) => {
  const content = line.slice(2).trim();
  return `<li>${content}</li>`;
};

// Parses markdown blockquotes to html
const parseBlockquote = (line) => {
  const content = line.slice(1).trim();
  return `<blockquote>${content}</blockquote>`;
};

// [function: bool, function to execute if bool is true]
const conditions = [
  [(line) => line === '', () => '\n'],
  [(line) => /^#{1,6} /g.test(line), (line) => parseHeader(line)],
  [
    (line) => line.startsWith('* ') || line.startsWith('- '),
    (line) => parseUnorderedList(line),
  ],
  [(line) => line.startsWith('>'), (line) => parseBlockquote(line)],
  [_.stubTrue, (line) => `<p>${line}</p>`],
];

const convertMarkdownToHtml = _.flow(
  readFile,
  parseBolds,
  parseItalics,
  addLineBreaks,
  _.split('\n'),
  _.map(_.cond(conditions)),
  _.join(''),
  joinParagraphs,
  joinBlockquotes,
  writeFile
);

// others
// .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2'>$1</a>")
// .replace(/\n$/gim, '<br />')

function parseMarkdown(markdownText) {
  const htmlText = markdownText
    .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/!\[(.*?)\]\((.*?)\)/gim, "<img alt='$1' src='$2' />")
    .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2'>$1</a>")
    .replace(/\n$/gim, '<br />');

  return htmlText.trim();
}

convertMarkdownToHtml('test.md');
