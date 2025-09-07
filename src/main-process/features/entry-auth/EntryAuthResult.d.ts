// declare enum EntryAuthResult {
//     Success,
//     UserAlreadyExists,
//     UnknownError,
//     ErrorCreateAuthDir,
//     UserNotFound,

//     PasswordVerificationFailed,
// }

declare type EntryAuthResult = "success"
    | "user-already-exists"
    | "unknown-error"
    | "error-create-auth-dir"
    | "user-not-found"
    | "password-verification-failed"
    | "logged-in"
    | "not-logged-in";