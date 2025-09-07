import { IObservable } from "@/main-process/cores/IObservable";



/**
 * Design for single-user authentication service
 */
export interface IEntryAuthService extends IObservable<EntryAuthResult>{

    /**
     * Current auth state, notify to observers when auth state changes, 
     * can have value {@link EntryAuthResult "user-not-found" | "logged-in" | "not-logged-in" }
     */
    currentAuthState: EntryAuthResult;

    login(password: string): Promise<EntryAuthResult>;
    logout(): Promise<void>;
    // isAuthenticated(): Promise<EntryAuthResult>;
    // getCurrentUser(): Promise<string | null>;

   
    register(name: string, username: string, password: string): Promise<EntryAuthResult>;

    /**
     * Check if a user already exists.
     */
    checkUserExists(): Promise<IUserCredModel | null>;

    checkCurrentAuthState(): Promise<EntryAuthResult>;

    
}