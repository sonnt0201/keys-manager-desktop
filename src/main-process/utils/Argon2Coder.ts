
import argon2 from 'argon2';

export class Argon2Coder {
    async defaultHash(input: string): Promise<string> {
        try {
            const hash = await argon2.hash(input); // default Argon2id + salt
            return hash; // Save this hash to your database
        } catch (err) {
            throw new Error('Password hashing failed');
        }
    }

    async defaultVerify(input: string, hash: string): Promise<boolean> {
        try {
            const isValid = await argon2.verify(hash, input);
            return isValid; // Returns true if the input matches the hash
        } catch (err) {
            throw new Error('Password verification failed');
        }   
    }
    
    async highSecurityHash(input: string): Promise<string> {
        try {
            const hash = await argon2.hash(input, {
                type: argon2.argon2id,
                timeCost: 4, // Number of iterations
                memoryCost: 128 * 1024, // 128 MB
                parallelism: 2, // Number of threads
            });
            return hash; // Save this hash to your database
        } catch (err) {
            throw new Error('High security password hashing failed');
        }
    }

    async highSecurityVerify(input: string, hash: string): Promise<boolean> {
        try {
            const isValid = await argon2.verify(hash, input);
            return isValid; // Returns true if the input matches the hash
        } catch (err) {
            throw new Error('High security password verification failed');
        }   
    }
}