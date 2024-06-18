import express from 'express';
import dataDiscrepancyRouter from './routes';

const app = express();

app.use(express.json()); // Middleware to parse JSON bodies

// Use the route
app.use('/api', dataDiscrepancyRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
