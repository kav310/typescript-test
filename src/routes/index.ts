import express from 'express';
import { DataDiscrepancyChecker } from '../controllers/data-discrepancy-controller';

const router = express.Router();

router.post('/check-data-discrepancy', DataDiscrepancyChecker);

export default router;
