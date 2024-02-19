
// Import configs
import APP_CONSTANTS from "../configs/constants.config";

// Import DTOs
import { RecordListingFilterOptions, RecordListingFilterRequestDTO } from "../dtos/Common.dto"
import { CompanyListingFilterOptions, CompanyListingFilterRequestDTO } from "../dtos/Company.dto";

// Import helper
import { base64EncodeStrToLastKey } from "./dynamoose.helper";

/**
 * RequestHelper
 * 
 * Helper to help with parsing/processing the request payloads.
 */
class RequestHelper {
    /**
     * parseFilterOptions
     * 
     * It reads the "filterOptions" received from the request and parses it in a way we/backend is expecting it to be.
     */
    static parseFilterOptions(filterOptions: CompanyListingFilterRequestDTO): CompanyListingFilterOptions {
        // pageSize
        let pageSize = parseInt(filterOptions.pageSize as unknown as string);
        if (APP_CONSTANTS.PAGE_LENGTH_OPTIONS.indexOf(pageSize) === -1) {
            pageSize = APP_CONSTANTS.PAGE_LENGTH_DEFAULT;
        }

        // lastKey
        let lastKey = undefined;
        if (filterOptions?.lastKey) {
            // Get lastKey
            let decodedStr = base64EncodeStrToLastKey(filterOptions.lastKey);
            if (decodedStr) {
                lastKey = decodedStr;
            }
        }

        let newFilterOptions: CompanyListingFilterOptions = filterOptions as any;
        newFilterOptions = {
            ...newFilterOptions,
            ... {
                pageSize: pageSize,
                lastKey: lastKey,
            }
        }
        return newFilterOptions;
    }
}

export { RequestHelper }