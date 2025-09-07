import { Stack, Card, Typography, Box, FormControl, FormLabel, TextField, Button } from "@mui/material";
import { useState } from "react";

/**
 * Login with password only
 * @param param0 
 * @returns 
 */
export const Login = ({
    onSubmit,
    helperText,
    passwordError
}: {
    onSubmit?: (user: { password: string }) => void;
    helperText?: string;
    passwordError?: boolean;
}) => {

    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        
        if (onSubmit) {
            onSubmit({

                password: password
            });
        }

        setPassword(""); // Clear the password field after submission
        // console.log("Button clicked, password: ", password);
    }

    return (
        <Stack direction="column" justifyContent="space-between">
            <Card variant="elevation" sx={{ paddingX: 10, paddingY: 4, width: '100%', maxWidth: 700, margin: '0 auto' }}>

                <Typography
                    component="p"
                    // variant="h6"
                    sx={{ width: '100%', fontSize: 'clamp(1.5rem, 4vw, 1.5rem)', marginBottom: 4 }}
                >
                    Enter your password
                </Typography>
                {/* <Divider sx={{marginY: 2}}/> */}

                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                >
                    <FormControl >


                        {/* Password */}
                        <FormControl >
                            {/* <FormLabel htmlFor="password" sx={{ alignSelf: 'flex-start' }}>Password</FormLabel> */}
                            <TextField
                                required
                                fullWidth
                                name="password"
                                size="small"
                                placeholder=""
                                type="password"
                                id="password"
                                autoFocus
                                // autoComplete="new-password"
                                variant="outlined"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            // autoComplete="new-password"
                            // onBlur={validatePassword}
                              error={passwordError || false}
                              helperText={helperText }
                            // color={passwordError ? 'error' : 'primary'}
                            />
                        </FormControl>


                    </FormControl>

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                    // disabled={
                    //     !nameHelperText(name)[0]
                    //     || !passwordHelperText(password)[0]
                    //     || !confirmPasswordHelperText(confirmPassword)[0]
                    // }
                    // onClick={() => {

                    //     // console.log("Button clicked, name: ", name, " username: ", username, " password: ", password);

                    // }}
                    >
                        Log in
                    </Button>
                </Box>

            </Card>
        </Stack>
    )
}