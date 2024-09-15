const urlSchema = {
    url: { type: 'string', required: true, unique: true },
    domain:{type: 'string', required: true, unique: true},
    dateAdded: { type: 'date', default: Date.now },
    lastChecked: { type: 'date', default: null },
    status: { type: 'string', enum: ['active', 'inactive'], default: 'active' }
  };
  
  module.exports = urlSchema;