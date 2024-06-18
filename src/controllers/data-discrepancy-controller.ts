import { Request, Response } from 'express';
import path from 'path';
import { PdfService } from '../services/pdf-service';
import { checkDiscrepancy } from '../utils/helpers';
import * as fs from "fs";
import response from '../utils/default-api-responses';

// Instantiate PdfService (adjust the instantiation as per your actual implementation)
const pdfService = new PdfService("TEST_KEY");

export const DataDiscrepancyChecker = async (req: Request, res: Response): Promise<void> => {
    try {
        const { companyName, pdfFilePath, assetFileName } = req.body;

        const pdfPath = assetFileName
            ? path.join("assets", assetFileName)
            : pdfFilePath;

        if (!pdfPath || !fs.existsSync(pdfPath)) {
            res.status(404).json(response.error(404, {}, new Error(`PDF file does not exist at path: ${pdfPath}`)));
            return;
        }


        const companyPDFData = await pdfService.extract(pdfPath);
        const { isDiscrepancy, discrepancies, matchedData } = checkDiscrepancy(companyName, companyPDFData);

        if (isDiscrepancy) {
            const data = {
                message: 'Data discrepancy found!',
                discrepancies  // Include discrepancies in the response
            };
            res.status(200).json(response.success(200, {}, data));
        } else {
            const data = {
                message: 'No data discrepancy.',
                summary: matchedData  // Include matched data as summary in the response
            };
            res.status(200).json(response.success(200, {}, data));
        }
    } catch (error: any) {
        console.error('Error in API handler:', error);
        res.status(500).json(response.error(500, {}, error));
    }
};
