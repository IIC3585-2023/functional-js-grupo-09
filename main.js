const fs = require('fs');
const _ = require('lodash/fp');

// Curried function to read file
const readFile = _.curry(fs.readFileSync)(_, 'utf8');

// Curried funtion to read file
const writeFile = _.curry(fs.writeFileSync)('output.html', _, 'utf8');

// Function to parse a text to a tag using regex
const parseTag = (regex, tag) => (text) =>
  text.replace(regex, `<${tag}>$1</${tag}>`);

const parseBoldAsterisc = parseTag(/\*\*(.*?)\*\*/gm, 'strong');
const parseBoldUnderscore = parseTag(/\_\_(.*?)\_\_/gm, 'strong');
const parseItalicAsterisc = parseTag(/\*(.*?)\*/gm, 'em');
const parseItalicUnderscore = parseTag(/\_(.*?)\_/gm, 'em');

const parseHeaders = (line) => {
  const level = line.split(' ')[0].length;
  const content = line.slice(level).trim();
  return `<h${level}>${content}</h${level}>`;
};

const parseLists = (line) => {
  const content = line.slice(2).trim();
  return `<li>${content}</li>`;
};

// [function(bool), function to execute if bool is true]
const conditions = [
  [(line) => line === '', () => '\n'],
  [(line) => /^#{1,6} /g.test(line), (line) => parseHeaders(line)],
  [
    (line) => line.startsWith('* ') || line.startsWith('- '),
    (line) => parseLists(line),
  ],
  [_.stubTrue, (line) => `<p>${line}</p>`],
];

// Parses markdown bold text to html
const parseBold = (text) =>
  _.flow(parseBoldAsterisc, parseBoldUnderscore)(text);

// Parses markdown italic text to html
const parseItalic = (text) =>
  _.flow(parseItalicAsterisc, parseItalicUnderscore)(text);

const convertMarkdownToHtml = _.flow(
  readFile,
  parseBold,
  parseItalic,
  _.split('\n'),
  _.map(_.cond(conditions)),
  _.join(''),
  writeFile
);

convertMarkdownToHtml('test.md');
