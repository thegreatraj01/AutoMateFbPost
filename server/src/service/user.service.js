
export const generateUsernameFromName = (name) => {
    const base = name.toLowerCase().replace(/\s+/g, '');
    const randomSuffix = Math.floor(Math.random() * 1000);
    return `${base}${randomSuffix}`;
};

/**
 * Generates a random password with at least one lowercase letter,
 * one uppercase letter, and one number.
 * 
 * @param {number} length - Length of password (minimum 6)
 * @returns {string} Random password meeting requirements
 */
export function generateRandomPassword(length = 10) {
    // Ensure minimum length of 6
    length = Math.max(6, length);

    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const special = '!@#$%^&*()-_=+[]{}|;:,.<>?';
    const allChars = lowercase + uppercase + numbers + special;

    // Start with required character types
    let password =
        lowercase.charAt(Math.floor(Math.random() * lowercase.length)) +
        uppercase.charAt(Math.floor(Math.random() * uppercase.length)) +
        numbers.charAt(Math.floor(Math.random() * numbers.length));

    // Add remaining random characters
    for (let i = 3; i < length; i++) {
        password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    // Shuffle the password
    return password
        .split('')
        .sort(() => Math.random() - 0.5)
        .join('');
}

