
export class Base64Coder { 

    defaultEncode(input: string): string {
        return Buffer.from(input, 'utf-8').toString('base64');
    }

    defaultDecode(input: string): string {
        return Buffer.from(input, 'base64').toString('utf-8');
    }

    decodeToBuffer(input: string): Buffer {
        return Buffer.from(input, 'base64');
    }

    encodeFromBuffer(input: Uint8Array | Buffer): string {
        return Buffer.from(input).toString('base64');
    }
}