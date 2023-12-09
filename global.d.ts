// Import the installed packages
import { Logger } from 'winston';

/**
 * global
 * 
 * Global declaration, it helps to access the mentioned properties globally in the application.
 */
declare global {
    // Winston Logger
    var logger: Logger;

    // Application/project root directory 
    // It is also helpful in accessing the resources with absolute path
    var appRootDir: string;
}

export { };