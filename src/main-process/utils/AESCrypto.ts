import crypto from "crypto";

export class AESCrypto {
    // AES-GCM helpers; returns {iv, tag, data} in Buffers
    aesGcmEncrypt(key: Buffer, plaintext: Buffer) {
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
        const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
        const tag = cipher.getAuthTag();
        return { iv, tag, data: ciphertext };
    }

    aesGcmDecrypt(key: Buffer, iv: Buffer, tag: Buffer, ciphertext: Buffer) {
        const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
        decipher.setAuthTag(tag);
        const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
        return plaintext;
    }

}