import { PinInputDialog } from "@/renderer/components/PinInputDialog";
import { useEffect, useState } from "react";


// auto-reqired to register 2fa PIN if detected logged-in state but 2nd auth file cred not exist
export const SecondAuthRegisterCheck = ({
    onStateChanged
}: {
    onStateChanged?: (secondAuthState?: SecondAuthResult) => void;
}) => {
    const [openSecondAuthDialog, setOpenSecondAuthDialog] = useState(false);
    // const [checking, setChecking] = useState(true);
    const [tempPINValue, setTempPINValue] = useState<string>("") // store temp pin value to wait to confirm

    useEffect(() => {
        onStateChanged?.(undefined);
        
        console.log("Second auth checker compoment mounted, checking status...");

        window.ipcRenderer.onEntryAuthUpdated(entryAuthState => {
            console.log("Entry auth state updated: ", entryAuthState);
            shouldOpenSecondAuthDialog(entryAuthState)
        })

        return () => window.ipcRenderer.removeAllListenersOfChannel("entry-auth:state");
    }, [])


    const shouldOpenSecondAuthDialog: (entryAuthState: EntryAuthResult ) => Promise<void> = async (entryAuthState: EntryAuthResult) => {

        console.log("Checking second auth status for register...");

      
        
        // window.ipcRenderer.

        if ( entryAuthState=== "logged-in") {
            const secondAuthAvailable = await window.ipcRenderer.secondAuth.isAvailable();
            if (!secondAuthAvailable) {

                console.log("Second auth not set up, opening dialog to register.");
                onStateChanged?.("auth-method-not-set");
                setOpenSecondAuthDialog(true);

            } else {

                onStateChanged?.("auth-method-already-set");
                setOpenSecondAuthDialog(false);
            }
        }
    }

    async function handleSubmit(pin: string): Promise<void> {
        try {
            await window.ipcRenderer.secondAuth.create(pin);
            setOpenSecondAuthDialog(false);
            onStateChanged?.("auth-method-already-set");
        } catch (error) {
            // Optionally handle error (e.g., show a message)
            console.error("Failed to register 2FA PIN:", error);
            onStateChanged?.("authentication-failed")
        }
    }

    return (
        <PinInputDialog
            title="Set up your two-factor authentication PIN"
            open={openSecondAuthDialog}
            onClose={() => setOpenSecondAuthDialog(false)}
            onSubmit={handleSubmit
            }

            confirmMode
            submitButton
        />
    )
} 