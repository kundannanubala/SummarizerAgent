const articleSchema = {
    title: { type: 'string' },
    summary: { type: 'string' },
    link: { type: 'string' },
    author: { type: 'string' },
    published_date: { type: 'date' },
    xml_url: { type: 'string'},
    image_url: { type: 'string' },
    created_at: { type: 'date', default: Date.now },
    updated_at: { type: 'date', default: Date.now }
  };
  
  module.exports = articleSchema;