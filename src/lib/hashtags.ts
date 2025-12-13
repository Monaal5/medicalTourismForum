export const extractHashtags = (text: string): string[] => {
    if (!text) return [];
    const matches = text.match(/#[a-zA-Z0-9_]+/g);
    if (!matches) return [];
    // Remove the # and filter out duplicates
    return [...new Set(matches.map((tag) => tag.slice(1)))];
};
