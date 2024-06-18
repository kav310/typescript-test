import { Request, Response } from 'express';
import { handler } from '../routes/handler';
import { PdfService } from '../services/pdf-service';
import response from '../utils/default-api-responses';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { checkDiscrepancy } from '../utils/helpers';
import * as fs from 'fs';

// Mock PdfService
vi.mock('../services/pdf-service', () => ({
    PdfService: vi.fn(() => ({
        extract: vi.fn(),
    })),
}));
const MockPdfService = PdfService as vi.MockedClass<typeof PdfService>;

// Mock checkDiscrepancy function
vi.mock('../utils/helpers', () => ({
    checkDiscrepancy: vi.fn(),
}));

describe('API Handler', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
        req = {
            body: {},
        } as Partial<Request>;

        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as Partial<Response>;
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should return success response with discrepancies', async () => {
        req.body = {
            companyName: 'TestCompany',
            pdfFilePath: 'existing/path.pdf',
            assetFileName: '',
        };

        const mockExtractResponse = {
            field1: 'value1',
            field2: 'value2',
        };

        const mockDiscrepancyResult = {
            isDiscrepancy: true,
            discrepancies: [
                { field: 'field1', pdfValue: 'value1', csvValue: 'value1' },
                { field: 'field2', pdfValue: 'value2', csvValue: 'value2' },
            ],
            matchedData: {},
        };

        const mockExtract = vi.fn();
        const mockPdfServiceInstance = new MockPdfService('TEST_KEY');
        mockPdfServiceInstance.extract = mockExtract;

        mockExtract.mockResolvedValue(mockExtractResponse);

        // Mock fs.existsSync to return true for this test case
        vi.mock('fs', () => ({
            existsSync: vi.fn().mockReturnValue(true), // Ensure it returns true for existing file
        }));

        const { checkDiscrepancy } = await import('../utils/helpers');
        const MockCheckDiscrepancy = checkDiscrepancy as vi.MockedFunction<typeof checkDiscrepancy>;
        MockCheckDiscrepancy.mockReturnValue(mockDiscrepancyResult);

        await handler(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            response.success(200, {}, {
                message: 'Data discrepancy found!',
                discrepancies: mockDiscrepancyResult.discrepancies,
            })
        );
    });


    it('should return success response with matched data when no discrepancies', async () => {
        req.body = {
            companyName: 'TestCompany',
            pdfFilePath: 'existing/path.pdf',
            assetFileName: '',
        };

        const mockExtractResponse = {
            field1: 'value1',
            field2: 'value2',
        };

        const mockDiscrepancyResult = {
            isDiscrepancy: false, // No discrepancies
            matchedData: {
                field1: 'value1',
                field2: 'value2',
            },
        };

        const mockExtract = vi.fn();
        const mockPdfServiceInstance = new MockPdfService('TEST_KEY');
        mockPdfServiceInstance.extract = mockExtract;

        mockExtract.mockResolvedValue(mockExtractResponse);

        // Mock fs.existsSync to return true for this test case
        vi.mock('fs', () => ({
            existsSync: vi.fn().mockReturnValue(true), // Ensure it returns true for existing file
        }));

        const { checkDiscrepancy } = await import('../utils/helpers');
        const MockCheckDiscrepancy = checkDiscrepancy as vi.MockedFunction<typeof checkDiscrepancy>;
        MockCheckDiscrepancy.mockReturnValue(mockDiscrepancyResult);

        await handler(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            response.success(200, {}, {
                message: 'No data discrepancy.',
                summary: mockDiscrepancyResult.matchedData,
            })
        );
    });
});
