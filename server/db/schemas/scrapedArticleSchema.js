const scrapedArticleSchema = {
    title: { type: 'string', required: true },
    link: { type: 'string', required: true },
    author: { type: 'string', required: true },
    published_date: { type: 'date', required: true },
    content: { type: 'string', required: true },
    scraped_at: { type: 'date', default: Date.now }
  };
  
  module.exports = scrapedArticleSchema;