import { Request, Response } from 'express';
import { CompanyDataRepository } from '../services/company-data-repository-service';
import { PdfService } from '../services/pdf-service';
import { CSVData } from '../services/company-data-repository-service';
import { CompanyPDFData } from '../services/pdf-service';
import response from '../utils/default-api-responses';

export class DataDiscrepancyChecker {
    private companyDataRepository: CompanyDataRepository;
    private pdfService: PdfService;

    constructor(
        private dataRepository: CompanyDataRepository,
        private pdfServiceInstance: { extract: Mock<any, any> },
    ) {
        this.companyDataRepository = dataRepository;
        this.pdfService = pdfServiceInstance;
    }

    async checkDataDiscrepancy(req: Request, res: Response) {
        try {
            const { companyName, pdfFilePath } = req.body;

            // Get data from CSV based on company name
            const csvData: CSVData[] = await this.companyDataRepository.getAllData();
            const companyCsvData: CSVData | undefined = csvData.find(data => data['Company Name'] === companyName);

            if (!companyCsvData) {
                return response.error(404, {}, new Error(`Company '${companyName}' not found in CSV data.`));
            }

            // Extract data from PDF
            const pdfData: CompanyPDFData = await this.pdfService.extract(pdfFilePath);

            // Compare data and find discrepancies
            const discrepancies: any[] = [];
            Object.keys(pdfData).forEach((key) => {
                const pdfValue = pdfData[key];
                const csvValue = companyCsvData[key];

                // Compare values
                if (pdfValue !== csvValue) {
                    discrepancies.push({
                        companyName,
                        field: key,
                        pdfValue,
                        csvValue,
                    });
                }
            });

            // Prepare response
            const data = {
                pdfData,
                csvData: companyCsvData,
                discrepancies,
            };

            return response.success(200, {}, data);
        } catch (error: any) {
            console.error('Error checking data discrepancy:', error);
            return response.error(500, {}, error);
        }
    }
}
