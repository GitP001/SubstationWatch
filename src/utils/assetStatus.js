// this is an example of derived state
export function getAssetStatus(asset) {
    const { temperature, thresholds } = asset;
    // We must check ALARAM first
    if (temperature >= thresholds.alarm) {
        return "ALARM";
    } else if (temperature >= thresholds.warning) {
        return "WARNING";
    } else {
        return "NORMAL";
    }
}
