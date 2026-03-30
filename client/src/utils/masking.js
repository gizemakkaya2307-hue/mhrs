export const maskEmail = (email) => {
    if (!email) return "";
    const [user, domain] = email.split("@");
    if (!user || !domain) return email;
    return `${user.charAt(0)}***@${domain}`;
};

export const maskTC = (tc) => {
    if (!tc) return "";
    return `${tc.slice(0, 2)}*******${tc.slice(-2)}`;
};

export const maskName = (name) => {
    if (!name) return "";
    const parts = name.split(" ");
    return parts.map(p => p.charAt(0) + "***").join(" ");
};
