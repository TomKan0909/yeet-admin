import app from './app';
// We still import config to get the port number
import config from './config';

const port = config.port || 3001;

app.listen(port, () => {
  // This log will appear in your Docker container's logs
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
