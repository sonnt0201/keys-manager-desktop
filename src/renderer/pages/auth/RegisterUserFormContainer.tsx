import { useState } from "react";
import { RegisterUserForm } from "./RegisterUserForm"
import { PinInputDialog } from "@/renderer/components/PinInputDialog";



/**
 * Contains the RegisterUserFormContainer component and logics to handle data (IPC calls)
 */
export const RegisterUserFormContainer = ({
    onRegisterCompletion
}: {
    onRegisterCompletion?: (result: EntryAuthResult) => void;
}) => {

    const [openSecondAuthDialog, setOpenSecondAuthDialog] = useState(false);
    // const [availableUserInfo, setAvailableUserInfo] = useState<IUserCredModel | null>(null);

    // register first auth
    const doRegister = async (user: IUserCredModel) => {



        const result = await window.ipcRenderer.registerUser(user);
        console.log("Register result: ", result);

        if (result === 'success') {

            // check first auth state first 
            // const secondResult = await window.ipcRenderer.secondAuth.isAvailable();
           
            // if (secondResult) {
            //     console.log("Second auth already set up clearing anyway");
            //     await window.ipcRenderer.secondAuth.remove();
            // }

            if (onRegisterCompletion) {
                onRegisterCompletion("success");
                return;
            }

            // setOpenSecondAuthDialog(true);
            // register second auth before noti to parent component
        } else {
            // first auth registration failed, still noti to parent component
            if (onRegisterCompletion) {
                onRegisterCompletion(result);
            }
        }

        // if (onRegisterCompletion) {
        //     onRegisterCompletion(result);
        // }
        // Handle the result of the registration, e.g., navigate to another page or show a message


    }



    // const onSubmitSecondAuthPIN: (pin: string) => void  =  async (pin: string) =>  {
    //     const secondResult = await window.ipcRenderer.secondAuth.create(pin)

    //     if (secondResult === "success") {
    //         setOpenSecondAuthDialog(false);
            
    //     }

    //     if (onRegisterCompletion) onRegisterCompletion("unknown-error");
    //     return;
    // }

    return (<>
        <RegisterUserForm

            onSubmit={(user: IUserCredModel) => {
                // console.log("Registering from container: ", user);
                doRegister(user);
            }
            }
        />

       
    </>


    )

}