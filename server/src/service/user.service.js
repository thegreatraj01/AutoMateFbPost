
export const generateUsernameFromName = (name) => {
    const base = name.toLowerCase().replace(/\s+/g, '');
    const randomSuffix = Math.floor(Math.random() * 1000);
    return `${base}${randomSuffix}`;
};


