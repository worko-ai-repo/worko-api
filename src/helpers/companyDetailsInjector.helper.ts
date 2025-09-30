// Import services
import CompanyService from "../services/Company.service";

// Import models
import { DbCompanyDetailDto } from "../db/models/CompanyDetail.model";

export async function attachCompanyDetails<T extends { companyId: string }>(data: T[]): Promise<(T & { companyDetails?: DbCompanyDetailDto })[]> {
    // Logger
    global.logger.warn('Attaching Company details to the data set. [HELPER]', {
        filePath: __filename,
        methodName: attachCompanyDetails.name,
    });
    // Validate input
    if (!data.length || !data[0]?.companyId){
        global.logger.warn('Cannot inject company details to an invalid data set [HELPER]', {
            filePath: __filename,
            methodName: attachCompanyDetails.name,
        });

        // return existing data without company details
        return data;
    }
    // Get unique company IDs
    const uniqueCompanyIds: string[] = Array.from(new Set(data.map(item => item.companyId)));

    // Fetch company details for all unique IDs
    const companiesDetails = await CompanyService.getCompanyDetailsByIds(uniqueCompanyIds);

    // Convert company details to a Map for easy access
    const companiesMap: Map<string, DbCompanyDetailDto> = new Map(companiesDetails.map((company: DbCompanyDetailDto) => [company.id, company]));

    // Map over data to attach company details
    return data.map(item => {
        // Get company details
        const companyDetails = companiesMap.get(item.companyId);

        // if company details are not found then return the item with company details as undefined
        if (!companyDetails) {
            // Log a warning if company details are not found
            global.logger.warn(`Company details not found for companyId: ${item.companyId} [HELPER]`, {
                filePath: __filename,
                methodName: attachCompanyDetails.name,
                companyId: item.companyId,
            });

            // Return the item with company details as undefined
            return item;
        }
        // Attach company details to the item and return the final object
        return {
            ...item,
            companyDetails: companyDetails
        };
    });
}