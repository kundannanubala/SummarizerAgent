const express = require('express');
const { connectToDatabase } = require('./db/connect');
const routes = require('./routes');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

// Use routes
app.use('/api', routes);

// Connect to the database, then start the server
connectToDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch(console.error);

// Handle server shutdown
process.on('SIGINT', async () => {
  await client.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});