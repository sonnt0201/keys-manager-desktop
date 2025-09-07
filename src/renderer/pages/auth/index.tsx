import { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import { RegisterUserFormContainer } from "./RegisterUserFormContainer";
import { LoginContainer } from "./LoginContainer";
import { useEntryAuthState } from "@/renderer/hooks/useAuthState";
import { SecondAuthRegisterCheck } from "./SecondAuthRegisterCheck";

/**
 * Entry auth page:
 * - Handles initial register/login
 * - Forces setup of second auth (PIN) if missing
 * - Calls allDone() only after everything is complete
 */
const Entry = ({
  authState,
  allDone,
}: {
  authState: EntryAuthResult | "loading" | null;
  allDone?: () => void;
}) => {
  const { availableUserInfo, updateAuthState } = useEntryAuthState();
  const [secondAuthResult, setSecondAuthResult] = useState<SecondAuthResult>();

  // Only proceed to dashboard when:
  // - entry auth = logged-in
  // - second auth is fully set
  useEffect(() => {
    if (authState === "logged-in" && secondAuthResult === "auth-method-already-set") {
      allDone?.();
    }
  }, [authState, secondAuthResult]);

  return (
    <div className="entry-page">
      <Typography
        component="h4"
        variant="h4"
        sx={{
          width: "100%",
          fontSize: "clamp(2rem, 10vw, 2.15rem)",
          marginBottom: 4,
        }}
      >
        {!availableUserInfo && "Welcome to Keys Manager"}
        {availableUserInfo &&
          `Welcome back, ${availableUserInfo.name || availableUserInfo.username}!`}
      </Typography>

      {authState === "user-not-found" && (
        <RegisterUserFormContainer
          onRegisterCompletion={async () => {
            await updateAuthState();
          }}
        />
      )}

      {authState === "not-logged-in" && (
        <LoginContainer
          onLoginCompletion={async () => {
            await updateAuthState();
          }}
        />
      )}

      {/* Always mounted — decides if second auth dialog must open */}
      <SecondAuthRegisterCheck
        onStateChanged={(result) => {
          setSecondAuthResult(result);
        }}
      />

      {authState === "logged-in" &&
        secondAuthResult === "auth-method-already-set" &&
        "Authentication successful, redirecting to main page..."}
    </div>
  );
};

export default Entry;
