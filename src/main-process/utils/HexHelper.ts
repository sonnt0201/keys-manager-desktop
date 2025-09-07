

export class HexHelper {
    toHex(b: Uint8Array | Buffer): string {
        return Buffer.from(b).toString("hex");
    }
    fromHex(hex: string) {
        return Buffer.from(hex, "hex");
    }
}