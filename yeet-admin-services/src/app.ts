import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler';
import userRouter from './api/users/user.route';

const app: Express = express();

// --- Middleware ---
// Enable Cross-Origin Resource Sharing
app.use(cors());

// Log HTTP requests in a custom format for morgan
morgan.token('params', (req: Request) => JSON.stringify(req.params));
morgan.token('query', (req: Request) => JSON.stringify(req.query));
morgan.token('body', (req: Request) => JSON.stringify(req.body));
const customFormat =
  ':method :url :status :res[content-length] - :response-time ms | params: :params | query: :query | body: :body';
app.use(morgan(customFormat));

// Parse incoming JSON requests
app.use(express.json());

// --- Simple Health Check Route ---
// This endpoint can be used to verify that the server is running.
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'Backend server is running successfully.',
    timestamp: new Date().toISOString(),
  });
});

// Mount API routes
app.use('/api', userRouter);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
