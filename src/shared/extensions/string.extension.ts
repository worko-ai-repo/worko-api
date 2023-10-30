interface String {
    strtr(replacePairs: Record<string, string>): string;
}

/**
 * strtr
 * 
 * This (strtr) is equivalent of php "strtr" function which essentially replaces the text from string with the provided replacement text
 * 
 * @link https://www.php.net/manual/en/function.strtr.php
 * @params {Record<string, string>} replacePairs
 * @returns {string}
 */
String.prototype.strtr = function (replacePairs: Record<string, string>): string {
    const search = Object
        .keys(replacePairs)
        .map((str: string) => {
            return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escapes special characters
        })
        .join('|');
    const regex = new RegExp(search, 'g');
    return this.replace(regex, (match) => replacePairs[match]);
};