export function numberToString(num: number) {
    if (num >= 1000000000) {
        return (num / 100000000).toFixed(1) + "亿";
    }
    if (num >= 100000) {
        return (num / 10000).toFixed(1) + "万";
    }
    return num.toString();
}

export function getTodayDateString(): string {
    const d = new Date();
    return d.toISOString().split('T')[0]; // "2025-10-24"
}