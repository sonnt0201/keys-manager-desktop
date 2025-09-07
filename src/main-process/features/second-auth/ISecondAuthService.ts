
export interface ISecondAuthService {

    /**
     * Create second auth method 
     * @param plainSecondAuthInput 
     */
    createSecondAuth(plainSecondAuthInput: string): Promise<SecondAuthResult>;

    /**
     * Verify second auth with input (2nd password or 2nd pin)
     * @param plainSecondAuthInput 
     */
    verifySecondAuth(plainSecondAuthInput: string): Promise<SecondAuthResult>;

    /**
     * Check if 2nd auth method is available, if not, should create with {@link createSecondAuth} method
     * 
     * Deppend on 2nd auth implementation, it maybe to check if 2nd auth cred file exists or 3rd party auth method/app exists ?
     */
    isSecondAuthAvailable(): Promise<boolean>;
    
    /**
     * Clear this second auth method (clear cred file or 3rd party auth service connection, depending on auth method)
     */
    removeSecondAuth(): Promise<SecondAuthResult>;

}


