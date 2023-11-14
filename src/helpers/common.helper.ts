/**
 * sleep
 * 
 * Sleep/wait for the provided duration and do nothing.
 * 
 * @param {number} ms
 * @returns {Promise}
 */
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * range
 * 
 * Returns the numeric array containing values starting from "start" to "stop" with provided "step" interval.
 * 
 * @param {number} start 
 * @param {number} stop 
 * @param {number} step [DEFAULT: 1]
 * @returns {number[]}
 */
export const range = (start: number, stop: number, step: number = 1): number[] => {
    return [...Array((stop + 1) - start).keys()]
        .filter(i => !(i % Math.round(step)))
        .map(v => start + v)
}