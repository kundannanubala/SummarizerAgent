const summarySchema = {
  title: { type: 'string', required: true },
  summary: { type: 'string', required: true },
  source: { type: 'string', required: true },
  created_at: { type: 'date', default: Date.now },
  keyword_ids: { type: 'array', default: [] }
};

module.exports = summarySchema;