const fs = require('fs');
const _ = require('lodash');

// function to read the .d file
const readMdFile = (mdpath) => fs.readFileSync(mdpath, 'utf8');

// function to write the .html file
const writeHTMLFile = (htmlpath, data) => fs.writeFileSync(htmlpath, data)

// function to replace headers
const replaceHeaderByNum = (h, text) => {
	const regex = new RegExp(`^#{${h}} (.*$)`, "gim");
	return text.replace(regex, `<h${h}>$1</h${h}>`);
};

const replaceHeaders = (headearsArr, text) => {
	headearsArr.forEach(num => {
		text = replaceHeaderByNum(num, text)
	});
	return text;
};

// function to make other replacements
function parseMarkdown(markdownText) {
	const htmlText = markdownText
		// paragraphs

		// bold
		.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
		.replace(/\_\_(.*)\_\_/gim, '<strong>$1</strong>')

		// italic
		.replace(/\*(.*)\*/gim, '<em>$1</em>')
		.replace(/\_(.*)\_/gim, '<em>$1</em>')

		// lists
		
		// others
		// .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2'>$1</a>")
		// .replace(/\n$/gim, '<br />')

	return htmlText.trim()
}

const compose = (f, g) => (x) => f([1,2,3,4,5,6], g(x));
const composeHeaders = compose(replaceHeaders, parseMarkdown);

data = readMdFile('test.md');
writeHTMLFile('output.html', composeHeaders(data))