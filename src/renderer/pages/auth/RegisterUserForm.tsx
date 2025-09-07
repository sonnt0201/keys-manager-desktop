import { Box, Button, Card, Checkbox, Divider, FormControl, FormControlLabel, FormLabel, Link, Paper, Stack, styled, TextField, Typography } from "@mui/material";
import { passwordStrength } from "check-password-strength";
import { useState } from "react";



/**
 * Independent, non-logic component that renders the form to register a new user.
 * @returns 
 */
export const RegisterUserForm = ({
  onSubmit
}: {
  onSubmit?: (user: IUserCredModel) => void;
}) => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const nameHelperText: (text: string) => [boolean, string] = (text: string) => {
    if (text == "") return [false, "Name is required"];
    if (text.length < 3) return [false, "Name must be at least 3 characters long"];
    return [true, ""];
  }

  const usernameHelperText: (text: string) => [
    boolean, // true if valid, false if invalid
    string
  ] = (text: string) => {
    if (text == "") return [false, "Email is required"];
    if (String(text)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      ))
      return [true, ""];

    return [false, "Wrong email format"];
  }


  const passwordHelperText: (text: string) => [boolean, string] = (text: string) => {
    if (text == "") return [false, "Password is required"];
    if (text.length < 8) return [false, "Password must be at least 8 characters long"];

    const strength = passwordStrength(text).value;
    if (strength === "Weak" || strength == "Too weak") return [false, strength];

    return [true, passwordStrength(text).value];

  }

  const confirmPasswordHelperText: (text: string) => [boolean, string] = (text: string) => {
    if (text == "") return [false, "Confirm password is required"];
    if (text !== password) return [false, "Passwords do not match"];
    return [true, ""];
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // console.log("Button clicked, name: ", name, " username: ", username, " password: ", password);

    if (onSubmit) {
      onSubmit({
        name: name,
        username: username,
        password: password
      });
    }
  }

  return (
    <Stack direction="column" justifyContent="space-between">
      <Card variant="elevation" sx={{ paddingX: 10, paddingY: 4, width: '100%', maxWidth: 700, margin: '0 auto' }}>

        <Typography
          component="h2"
          variant="h2"
          sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)', marginBottom: 4 }}
        >
          This is your first visit, let sign up!
        </Typography>
        {/* <Divider sx={{marginY: 2}}/> */}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <FormControl >
            <FormLabel htmlFor="name" sx={{ alignSelf: 'flex-start' }}>Full name</FormLabel>
            <TextField
              // autoComplete="name"
              size="small"
              name="name"
              required
              fullWidth
              id="name"
              placeholder="Your full name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={!nameHelperText(name)[0]}
              helperText={nameHelperText(name)[1]}
            // color={nameError ? 'error' : 'primary'}
            />
          </FormControl>

          {/* Email as username - not required */}
          <FormControl >
            <FormLabel htmlFor="email" sx={{ alignSelf: 'flex-start' }} >Email</FormLabel>
            <TextField
              required
              fullWidth
              id="email"
              size="small"
              placeholder="your@email.com"
              name="email"

              autoComplete="email"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              // error={!usernameHelperText(username)[0]}
              helperText={"Optional, but recommended"}
            // usernameHelperText(username)[1]

            // color={passwordError ? 'error' : 'primary'}
            />
          </FormControl>

          {/* Password */}
          <FormControl >
            <FormLabel htmlFor="password" sx={{ alignSelf: 'flex-start' }}>Password</FormLabel>
            <TextField
              required
              fullWidth
              name="password"
              size="small"
              placeholder=""
              type="password"
              id="password"
              // autoComplete="new-password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              // autoComplete="new-password"
              // onBlur={validatePassword}
              error={!passwordHelperText(password)[0]}
              helperText={passwordHelperText(password)[1]}
            // color={passwordError ? 'error' : 'primary'}
            />
          </FormControl>

          {/*  Confirm Password */}
          <FormControl >
            <FormLabel htmlFor="password" sx={{ alignSelf: 'flex-start' }}>Confirm Password</FormLabel>
            <TextField
              required
              fullWidth
              name="confirm-password"
              size="small"
              placeholder=""
              type="password"
              id="confirm password"
              // autoComplete="new-password"
              variant="outlined"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              // autoComplete="new-password"
              // onBlur={validatePassword}
              error={!confirmPasswordHelperText(confirmPassword)[0]}
              helperText={confirmPasswordHelperText(confirmPassword)[1]}
            // color={passwordError ? 'error' : 'primary'}
            />
          </FormControl>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={
              !nameHelperText(name)[0]
              || !passwordHelperText(password)[0]
              || !confirmPasswordHelperText(confirmPassword)[0]
            }
          // onClick={() => {


          // }}
          >
            Sign up
          </Button>
        </Box>

      </Card>
    </Stack>
  )
}