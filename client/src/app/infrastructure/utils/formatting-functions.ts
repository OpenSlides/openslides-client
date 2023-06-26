/**
 *
 * @param ssid
 * @param encryption
 * @param password
 */
export function formatWiFiConfig(ssid: string, encryption: string, password?: string): string {
    if (!ssid || (!!encryption && encryption !== `nopass` && !password)) {
        throw new Error(
            `Can't format WiFi config because of missing ${
                !ssid ? `SSID` : encryption ? `encryption mechanism` : `password`
            }`
        );
    }

    return (
        `WIFI:S:` +
        escapeSpecialCharactersForWiFiConfig(ssid) +
        `;T:` +
        encryption +
        `;P:` +
        escapeSpecialCharactersForWiFiConfig(password) +
        `;;`
    );
}

function escapeSpecialCharactersForWiFiConfig(text: string): string {
    for (let symbol of [`\\`, `;`, `,`, `"`, `:`]) {
        text = text.split(symbol).join(`\\${symbol}`);
    }
    return text;
}
