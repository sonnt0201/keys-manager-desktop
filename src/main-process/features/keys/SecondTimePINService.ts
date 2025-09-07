
import * as fs from "fs";
import * as argon2 from "argon2";
import { AUTH_DIR, PIN_FILE } from "@/main-process/constant";
import { Argon2Coder } from "@/main-process/utils/Argon2Coder";
import { HexHelper } from "@/main-process/utils/HexHelper";
import { Sha256Coder } from "@/main-process/utils/Sha256Coder";
import { Base64Coder } from "@/main-process/utils/Base64Coder";
import { AESCrypto } from "@/main-process/utils/AESCrypto";
import bcrypt from "bcrypt";

export type PINResult = "success" | "pin-not-set" | "valid-pin" | "invalid-pin" | "unknown-error" | "pin-file-error";

// deprecated, unused
export interface ISecondTimePINService {

    /** BEGIN: Entry Password Context */

    /**
     * save in .auth/user-2ndpin.txt
     * 
     * @param seed should be the current password hash save in app context 
     * @param secondTimePIN 
     */
    saveSecondTimePIN(seed: string, plainSecondTimePIN: string): Promise<PINResult>;

    generateRandomSalt(): Promise<string>;

    /**
     * 
     * @param seed should be the current password hash save in app context
     */
    validateSecondTimePIN(seed: string, plainSecondTimePIN: string): Promise<PINResult>;
    /** END: Entry Password Context */

    /** BEGIN: {{hashed Entry Password + hashed 2nd PIN + Stored random salt}} Context */

    /**
     *  retrieve a salt for encryption, Ultimate = Context Salt + Random Salt
     * @param contextSalt hashed Entry Password (save in app context) + hashed 2nd PIN (user input)
     * @param storedRandomSalt save in key model 
     */
    ultimateSalt(contextSalt: string, storedRandomSalt: string): string;
    /** END: {{hashed Entry Password + hashed 2nd PIN + Stored random salt}} Context */

    /**
  * Create a runtime-only context salt from two runtime secrets using HMAC:
  *   contextSalt = HMAC_SHA256(key = hashedEntryPassword, data = hashedSecondPIN)
  * Returns hex.
  */
    makeContextSalt(hashedEntryPassword: string, hashedSecondPIN: string): string

    encryptWithUltimateSalt(keyValue: string, ultimateSalt: string): string; // encrypt key value with ultimate salt
    decryptWithUltimateSalt(encryptedValue: string, ultimateSalt: string): string; // decrypt key value with ultimate salt
}


export class SecondTimePINService implements ISecondTimePINService {

    async generateRandomSalt(): Promise<string> {
        return await bcrypt.genSalt(10);
    }

    async saveSecondTimePIN(seed: string, plainSecondTimePIN: string): Promise<PINResult> {
        const input = `${seed}:${plainSecondTimePIN}`;

        const argon2Coder = new Argon2Coder();

        try {
            const hash = await argon2Coder.highSecurityHash(input);

            fs.mkdirSync(AUTH_DIR, { recursive: true });
            fs.writeFileSync(PIN_FILE, hash, { encoding: "utf8", flag: "w" });
            return "success"
        }
        catch (err) {

            return "unknown-error";
        }




    }

    async validateSecondTimePIN(seed: string, plainSecondTimePIN: string): Promise<PINResult> {
        if (!fs.existsSync(PIN_FILE)) return "pin-not-set";
        const stored = fs.readFileSync(PIN_FILE, "utf8");
        const input = `${seed}:${plainSecondTimePIN}`;
        try {
            const argon2Coder = new Argon2Coder();
            const isValid = await argon2Coder.highSecurityVerify(input, stored);
            return isValid ? "valid-pin" : "invalid-pin";
        } catch {
            return "unknown-error";
        }
    }

    /**
     * Prepare a context salt from two runtime secrets using HMAC. Use for data-encryption purpose
     * 
     * Use at encrypt/data-creation step
     * 
     * @param hashedEntryPassword 
     * @param hashedSecondPIN 
     * @returns 
     */
    makeContextSalt(hashedEntryPassword: string, hashedSecondPIN: string): string {

        const hexHelper = new HexHelper();
        const sha256Coder = new Sha256Coder();

        const key = hexHelper.fromHex(hashedEntryPassword);
        const data = hexHelper.fromHex(hashedSecondPIN);
        return sha256Coder.hmacSha256Hex(key, data);

    }

    /**
     * Retrieve salt based on context salt and STORED random salt. Use for data-read/authentication purpose
     * @param contextSaltHex 
     * @param storedRandomSaltB64 
     * @returns 
     */
    ultimateSalt(contextSaltHex: string, storedRandomSaltB64: string): string {

        const base64Coder = new Base64Coder();
        const hexHelper = new HexHelper();
        const sha256Coder = new Sha256Coder();

        const key = hexHelper.fromHex(contextSaltHex);
        const data = base64Coder.decodeToBuffer(storedRandomSaltB64);
        return sha256Coder.hmacSha256Hex(key, data);
    }

    /**
  * Derive a 256-bit AES key from the ultimate salt using HKDF-SHA256.
  * We treat the ultimateSalt (hex) as IKM; salt+info are fixed service strings.
  * Then AES-256-GCM encrypt the plaintext.
  *
  * Output format (string):
  *   v1.gcm.<iv_b64>.<tag_b64>.<ct_b64>
  */
    encryptWithUltimateSalt(plainText: string, ultimateSaltHex: string): string {

        const hexHelper = new HexHelper();
        const sha256Coder = new Sha256Coder();
        const aesCrypto = new AESCrypto();
        const base64Coder = new Base64Coder();

        const ikm = hexHelper.fromHex(ultimateSaltHex);

        const kek = sha256Coder.hkdfSha256(
            ikm,
            Buffer.from("SecondTimePINService:hkdf-salt", "utf8"),
            Buffer.from("kek", "utf8"),
            32
        );

        const { iv, tag, data } = aesCrypto.aesGcmEncrypt(Buffer.from(kek), Buffer.from(plainText, "utf8"));
        return `v1.gcm.${base64Coder.encodeFromBuffer(iv)}.${base64Coder.encodeFromBuffer(tag)}.${base64Coder.encodeFromBuffer(data)}`;
    }

    decryptWithUltimateSalt(encryptedValue: string, ultimateSaltHex: string): string {
        const base64Coder = new Base64Coder();
        const hexHelper = new HexHelper();
        const sha256Coder = new Sha256Coder();
        const aes = new AESCrypto();

        const parts = encryptedValue.split(".");
        if (parts.length !== 5 || parts[0] !== "v1" || parts[1] !== "gcm") {
            throw new Error("Unsupported ciphertext format");
        }
        const iv = base64Coder.decodeToBuffer(parts[2]);
        const tag = base64Coder.decodeToBuffer(parts[3]);
        const ct = base64Coder.decodeToBuffer(parts[4]);

        const ikm = hexHelper.fromHex(ultimateSaltHex);
        const kek = sha256Coder.hkdfSha256(
            ikm,
            Buffer.from("SecondTimePINService:hkdf-salt", "utf8"),
            Buffer.from("kek", "utf8"),
            32
        );

        const pt = aes.aesGcmDecrypt(Buffer.from(kek), iv, tag, ct);
        return pt.toString("utf8");
    }
}

