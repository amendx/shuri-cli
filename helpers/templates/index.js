const { testTemplate } = require("./test-templates.js");
const { styleTemplate } = require("./style-templates.js");
const { getVueTemplate } = require("./vue-templates.js");
const { docsMdTemplate, docsApiTemplate, docsVueTemplate } = require("./docs-templates.js");
const { indexTemplate } = require("./index-templates.js");

module.exports = {
  testTemplate,
  styleTemplate,
  docsMdTemplate,
  docsVueTemplate,
  docsApiTemplate,
  getVueTemplate,
  indexTemplate,
};
