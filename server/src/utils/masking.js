export const maskEmail = (email) => {
    if (!email) return "";
    const [user, domain] = email.split("@");
    return `${user.charAt(0)}***@${domain}`;
};

export const maskPhone = (phone) => {
    if (!phone) return "";
    return `${phone.slice(0, 3)} *** ** ${phone.slice(-2)}`;
};

export const maskName = (name) => {
    if (!name) return "";
    const parts = name.split(" ");
    return parts.map(p => p.charAt(0) + "***").join(" ");
};
