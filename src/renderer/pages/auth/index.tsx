import Button from "@mui/material/Button";
import { useEffect, useState } from "react";
import { RegisterUserForm } from "./RegisterUserForm";
import { Typography } from "@mui/material";
import { RegisterUserFormContainer } from "./RegisterUserFormContainer";
import { LoginContainer } from "./LoginContainer";
import { update } from "@/main-process/update";
import { useEntryAuthState } from "@/renderer/hooks/useAuthState";
import { SecondAuthRegisterCheck } from "./SecondAuthRegisterCheck";

/**
 * 
 * @param props.onEntryAuthCompleted - Callback function to be called when entry authentication (registering and logging in) is done and app should be redirected to main page.
 * @returns 
 */
const Entry = ({
  authState}
: {
  authState:EntryAuthResult | "loading" | null
}) => {

  const { availableUserInfo, updateAuthState } = useEntryAuthState();
  const [secondAuthResult, setSecondAuthResult] = useState<SecondAuthResult>();


  return (
    <div className="entry-page " >
      <Typography
        component="h4"
        variant="h4"
        sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)', marginBottom: 4 }}
      >
        {!availableUserInfo && "Welcome to Keys Manager"}
        {availableUserInfo && `Welcome back, ${availableUserInfo.name || availableUserInfo.username}!`}
      </Typography>

      {authState == "user-not-found" && <RegisterUserFormContainer
        onRegisterCompletion={(_) => {
          updateAuthState().then(() => {

          });
        }}
      />}

      {authState == "not-logged-in" && <LoginContainer
        onLoginCompletion={(result) => {

          updateAuthState();

        }}
      />}

      <SecondAuthRegisterCheck
        onStateChanged={(result) => {
          setSecondAuthResult(result);
        }
        }
      />
      {authState == "logged-in" && secondAuthResult == "auth-method-already-set" && "Authen successfully, redirecting to main page..."}
    </div>
  );
}

export default Entry;