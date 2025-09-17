class OtpHelper {
    /**
     * Generate a random OTP of the specified length.
     *
     * @param {number} length - the length of the OTP
     * @return {string} the generated OTP
     */
    static generateOtp(length: number): string {
        let code: string = '';
        for (let i = 0; i < length; i++) {
            code += Math.floor(Math.random() * 10);
        }
        return code;
    }
}

export { OtpHelper }