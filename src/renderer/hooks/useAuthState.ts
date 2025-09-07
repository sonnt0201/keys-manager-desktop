import { useEffect, useState } from "react";

/**
 * 
 * @returns authState - Current auth state, can be one of: "user-not-found", "not-logged-in", "logged-in", "loading", or "unknown-error"
 * @returns availableUserInfo - User information if available, null if not
 * @returns updateAuthState - Function to update the auth state, new auth state will be fetched from ipc-main and saved to authState and availableUserInfo
 */
export const useEntryAuthState  = () => {

    const [availableUserInfo, setAvailableUserInfo] = useState<IUserCredModel | null>(null);
    const [authState, setAuthState] = useState<EntryAuthResult | "loading" | null>(null);

    // const [authState, setAuthState] = useState<EntryAuthResult | null>(null);
    useEffect(() => {

        updateAuthState();

        return () => window.ipcRenderer.removeAllListener();

    }, [])

    const updateAuthState = async () => {
        setAuthState("loading");

        try {
            const authState = await window.ipcRenderer.authState();
            setAuthState(authState);

            if (authState === "user-not-found") {
                setAvailableUserInfo(null);
            } else if (authState === "not-logged-in") {
                const userInfo = await window.ipcRenderer.checkUserExists();
                setAvailableUserInfo(userInfo);
            } else if (authState === "logged-in") {
                const userInfo = await window.ipcRenderer.checkUserExists();
                setAvailableUserInfo(userInfo);
            }
        } catch (error) {
            console.error("Failed to update auth state:", error);
            setAuthState("unknown-error");
        }
    }

    return {

        authState,
        availableUserInfo,
        updateAuthState // funtion to ask ipc-main to update current auth state
    }
}