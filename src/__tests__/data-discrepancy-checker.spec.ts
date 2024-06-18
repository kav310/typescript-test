import { Request, Response } from 'express';
import { DataDiscrepancyChecker } from '../controllers/data-discrepancy-controller';
import { CompanyDataRepository } from '../services/company-data-repository-service';
import { PdfService } from '../services/pdf-service';
import response from '../utils/default-api-responses';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('../services/company-data-repository-service');
vi.mock('../services/pdf-service');
vi.mock('../utils/default-api-responses');

describe('DataDiscrepancyChecker', () => {
    let mockCompanyDataRepository: vi.Mocked<CompanyDataRepository>;
    let mockPdfService: vi.Mocked<PdfService>;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let dataChecker: DataDiscrepancyChecker;

    beforeEach(() => {
        mockCompanyDataRepository = new CompanyDataRepository() as vi.Mocked<CompanyDataRepository>;
        mockPdfService = new PdfService("TEST_KEY") as vi.Mocked<PdfService>;

        mockRequest = {
            body: {
                companyName: 'TestCompany',
                pdfFilePath: 'path/to/pdf',
            },
        };

        mockResponse = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };

        dataChecker = new DataDiscrepancyChecker(mockCompanyDataRepository, mockPdfService);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should return success response with no discrepancies', async () => {
        const csvData = [
            { 'Company Name': 'TestCompany', field1: 'value1', field2: 'value2' },
        ];

        const pdfData = { field1: 'value1', field2: 'value2' };

        mockCompanyDataRepository.getAllData.mockResolvedValue(csvData);
        mockPdfService.extract.mockResolvedValue(pdfData);

        await dataChecker.checkDataDiscrepancy(mockRequest as Request, mockResponse as Response);

        // Assertions for success response
        expect(response.success).toHaveBeenCalledWith(200, {}, {
            pdfData,
            csvData: csvData[0],
            discrepancies: [],
        });
    });

    it('should return error response if company not found in CSV data', async () => {
        const csvData = [
            { 'Company Name': 'OtherCompany', field1: 'value1', field2: 'value2' },
        ];

        mockCompanyDataRepository.getAllData.mockResolvedValue(csvData);

        await dataChecker.checkDataDiscrepancy(mockRequest as Request, mockResponse as Response);

        // Assertions for error response
        expect(response.error).toHaveBeenCalledWith(404, {}, expect.any(Error));
    });

    it('should return error response on internal server error', async () => {
        mockCompanyDataRepository.getAllData.mockRejectedValue(new Error('Internal Server Error'));

        await dataChecker.checkDataDiscrepancy(mockRequest as Request, mockResponse as Response);

        // Assertions for error response
        expect(response.error).toHaveBeenCalledWith(500, {}, expect.any(Error));
    });

    it('should return success response with no discrepancies if PDF data is empty', async () => {
        const csvData = [
            { 'Company Name': 'TestCompany', field1: 'value1', field2: 'value2' },
        ];

        const pdfData = {};

        mockCompanyDataRepository.getAllData.mockResolvedValue(csvData);
        mockPdfService.extract.mockResolvedValue(pdfData);

        await dataChecker.checkDataDiscrepancy(mockRequest as Request, mockResponse as Response);

        // Assertions for success response
        expect(response.success).toHaveBeenCalledWith(200, {}, {
            pdfData,
            csvData: csvData[0],
            discrepancies: [],
        });
    });
});
