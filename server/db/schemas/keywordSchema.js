const keywordSchema = {
    keyword: { type: 'string', required: true },
    type: { type: 'string', enum: ['phrase', 'single'], required: true },
    created_at: { type: 'date', default: Date.now },
    updated_at: { type: 'date', default: Date.now }
  };
  
  module.exports = keywordSchema;