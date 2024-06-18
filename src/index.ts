import express, { Request, Response } from 'express';
import { handler } from './routes/handler';

const app = express();
const PORT = 3000;

// Body parsing middleware
app.use(express.json());

// Endpoint for handling data discrepancy check
app.post('/check-discrepancy', async (req: Request, res: Response) => {
    await handler(req, res);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
