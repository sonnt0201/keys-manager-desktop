// import { IEntryAuthService } from "@/main-process/features/entry-auth/IEntryAuthService";
import { useEffect, useState } from "react";
import { Login } from "./Login"

/**
 * 
 */
export const LoginContainer = ({
    onLoginCompletion
}: {
    onLoginCompletion?: (state: EntryAuthResult) => void;
}) => {


    const [passwordError, setPasswordError] = useState(false);

    
    const doLoginWithPassword = async (user: { password: string }) => {

        // console.log("doLoginWithPassword called with user: ", user);
        try {
            const result = await window.ipcRenderer.login(user.password);
            // console.log("Login result: ", result);

            if (result == 'password-verification-failed') {
                console.log("Password verification failed.");
                setPasswordError(true);
                return;
            } 
            
            if (onLoginCompletion) {
                onLoginCompletion(result);
            }
            // Handle the result of the login, e.g., navigate to another page or show a message
        } catch (error) {
            console.error("Login failed: ", error);
            setPasswordError(true);
            // Handle the error, e.g., show an error message
        }

    }

    useEffect(() => {
        console.log("Password error state changed: ", passwordError);
    },[passwordError]);

    return (
        <Login
            onSubmit={(user: { password: string }) => {
                
                // console.log("LoginContainer received user: ", user);
                doLoginWithPassword(user);
            }}

            helperText={
                !passwordError ? "Enter your password to log in." :
                 "Wrong password. Please try again."}

            passwordError={passwordError}
            // onLoginCompletion={onLoginCompletion}
        />
    )

}