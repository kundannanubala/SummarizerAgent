const { xml_url, author } = require("./articleSchema");

const summarySchema = {
  title: { type: 'string', required: true },
  summary: { type: 'string', required: true },
  source: { type: 'string', required: true },
  xml_url:{ type: 'string', required:true},
  author:{ type: 'string', required:true},
  published_date:{ type: 'date', required:true},
  created_at: { type: 'date', default: Date.now },
  keyword_ids: { type: 'array', default: [] }
};

module.exports = summarySchema;