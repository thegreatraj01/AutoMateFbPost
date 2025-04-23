import User from "../models/user.model.js";


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

// user.service.js
export const findOrCreateFacebookUser = async (facebookData) => {
    const { id, email, name, picture } = facebookData;

    // Try to find user by facebookId first
    let user = await User.findOne({ facebookId: id });

    if (!user) {
        // If not found, try by email (if available)
        if (email) {
            user = await User.findOne({ email });

            // If found by email but doesn't have facebookId, update it
            if (user && !user.facebookId) {
                user.facebookId = id;
                user.authProvider = 'facebook';
                await user.save();
            }
        }
    }

    // If user still not found, create new user
    if (!user) {
        const username = generateUsernameFromName(name); // Implement this helper

        user = new User({
            facebookId: id,
            fullName: name,
            userName: username,
            email: email || null,
            isTemporaryEmail: !email, // Mark as temporary if no email
            isEmailVerified: !!email, // Mark as verified if email from FB
            avatar: picture?.data?.url || null,
            authProvider: 'facebook',
            password: generateRandomPassword(), 
        });

        await user.save();
    }

    // If user exists but was missing email, update if we now have it
    if (!user.email && email) {
        user.email = email;
        user.isTemporaryEmail = false;
        user.isEmailVerified = true;
        await user.save();
    }

    return user;
};