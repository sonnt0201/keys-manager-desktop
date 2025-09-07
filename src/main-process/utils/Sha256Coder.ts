import crypto from 'crypto';

export class Sha256Coder {

    /**
     * 
     * @param input string to be hashed
     * @returns hexadecimal string of the SHA-256 hash
     */
    hashToHex(input: string): string {
        const hash = crypto.createHash('sha256');
        return hash.update(input).digest('hex');
    }

    // HMAC-SHA256(data) keyed by key; returns hex
    hmacSha256Hex(key: Buffer, data: Buffer) {
        return crypto.createHmac("sha256", key).update(data).digest("hex");
    }

    // HKDF-SHA256(IKM, salt, info, length); returns Buffer
    hkdfSha256(ikm: Buffer, salt: Buffer, info: Buffer, length: number) {
      
        return crypto.hkdfSync("sha256", ikm, salt, info, length);
    }

}