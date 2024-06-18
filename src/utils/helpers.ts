import { CompanyPDFData } from '../services/pdf-service';

interface DiscrepancyResult {
    isDiscrepancy: boolean;
    discrepancies?: Record<string, { provided: any; extracted: any }>;
    matchedData?: CompanyPDFData;
}

export const checkDiscrepancy = (companyName: Record<string, any>, companyPDFData: CompanyPDFData): DiscrepancyResult => {
    const discrepancies: Record<string, { provided: any; extracted: any }> = {};
    let isDiscrepancy = false;

    // Check each field in companyName against companyPDFData
    for (const key in companyName) {
        if (companyPDFData[key] !== companyName[key]) {
            discrepancies[key] = {
                provided: companyName[key],
                extracted: companyPDFData[key]
            };
            isDiscrepancy = true;
        }
    }

    return {
        isDiscrepancy,
        discrepancies,
        matchedData: isDiscrepancy ? undefined : companyPDFData // Return matched data only if no discrepancies
    };
};
