import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

type PinInputDialogProps = {
  open: boolean;
  onClose?: () => void;
  onSubmit?: (pin: string) => void;
  hideValue?: boolean; // if true, show dots instead of numbers
  title?: string;
  helperText?: string;
  length?: number; // default 6
  submitButton?: boolean;
  confirmMode?: boolean; // if true, user must re-enter PIN
};

const hashString = async (input: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export const PinInputDialog: React.FC<PinInputDialogProps> = ({
  open,
  onClose,
  onSubmit,
  title = "Enter PIN",
  hideValue = false,
  helperText = "Please enter your 6-digit PIN.",
  length = 6,
  submitButton = false,
  confirmMode = false,
}) => {
  // state: first and second input if confirm mode
  const [values, setValues] = React.useState<string[]>(
    () => Array.from({ length }, () => "")
  );
  const [confirmValues, setConfirmValues] = React.useState<string[]>(
    () => Array.from({ length }, () => "")
  );
  const [confirmStep, setConfirmStep] = React.useState(false);

  const inputsRef = React.useRef<Array<HTMLInputElement | null>>([]);
  const confirmInputsRef = React.useRef<Array<HTMLInputElement | null>>([]);

  // Reset when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setValues(Array.from({ length }, () => ""));
      setConfirmValues(Array.from({ length }, () => ""));
      setConfirmStep(false);
      setTimeout(() => inputsRef.current[0]?.focus(), 50);
    }
  }, [open, length]);

  const moveFocus = (
    index: number,
    dir: 1 | -1,
    confirm: boolean = false
  ) => {
    const next = index + dir;
    const ref = confirm ? confirmInputsRef : inputsRef;
    if (next >= 0 && next < length) ref.current[next]?.focus();
  };

  const handleChange = (
    index: number,
    val: string,
    confirm: boolean = false
  ) => {
    const digit = val.replace(/\D/g, "");
    if (!digit) return;

    const target = confirm ? [...confirmValues] : [...values];

    if (digit.length > 1) {
      for (let i = 0; i < digit.length && index + i < length; i++) {
        target[index + i] = digit[i];
      }
      confirm ? setConfirmValues(target) : setValues(target);
      const targetIndex = Math.min(index + digit.length, length - 1);
      (confirm ? confirmInputsRef : inputsRef).current[targetIndex]?.focus();
    } else {
      target[index] = digit;
      confirm ? setConfirmValues(target) : setValues(target);
      if (index < length - 1) {
        moveFocus(index, 1, confirm);
      }
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    const target = e.target as HTMLInputElement;
    const index = Number(target.dataset.index);
    const confirm = target.dataset.confirm === "true";

    if (e.key === "Backspace") {
      const arr = confirm ? confirmValues : values;
      if (arr[index]) {
        const next = [...arr];
        next[index] = "";
        confirm ? setConfirmValues(next) : setValues(next);
      } else {
        moveFocus(index, -1, confirm);
      }
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      moveFocus(index, -1, confirm);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      moveFocus(index, 1, confirm);
    }
    if (e.key === "Enter" && submitButton) {
      doSubmit();
    }
  };

  const handlePaste: React.ClipboardEventHandler<HTMLInputElement> = (e) => {
    const index = Number((e.target as HTMLInputElement).dataset.index);
    const confirm = (e.target as HTMLInputElement).dataset.confirm === "true";
    const text = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!text) return;
    e.preventDefault();
    handleChange(index, text, confirm);
  };

  const allFilled = (arr: string[]) => arr.every((v) => v.length === 1);

  const doSubmit = () => {
    if (confirmMode && !confirmStep) {
      if (allFilled(values)) {
        setConfirmStep(true);
        setTimeout(() => confirmInputsRef.current[0]?.focus(), 50);
      }
      return;
    }

    if (confirmMode && confirmStep) {
      if (values.join("") !== confirmValues.join("")) {
        alert("PINs do not match, please try again.");
        setValues(Array.from({ length }, () => ""));
        setConfirmValues(Array.from({ length }, () => ""));
        setConfirmStep(false);
        setTimeout(() => inputsRef.current[0]?.focus(), 50);
        return;
      }
    }

    const pin = confirmMode ? confirmValues.join("") : values.join("");
    hashString(pin).then((hex) => {
      onSubmit?.(hex);
    });
  };

  // Auto-submit once all digits filled
  React.useEffect(() => {
    if (submitButton) return;
    if (!confirmMode && allFilled(values)) {
      doSubmit();
    } else if (confirmMode) {
      if (!confirmStep && allFilled(values)) {
        setConfirmStep(true);
        setTimeout(() => confirmInputsRef.current[0]?.focus(), 50);
      } else if (confirmStep && allFilled(confirmValues)) {
        doSubmit();
      }
    }
  }, [values, confirmValues, confirmMode, confirmStep, submitButton]);

  const renderInputs = (arr: string[], confirm: boolean = false) => (
    <Stack direction="row" spacing={1} justifyContent="center">
      {arr.map((v, i) => (
        <TextField
          key={i}
          value={v}
          onChange={(e) => handleChange(i, e.target.value, confirm)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          type={hideValue ? "password" : "text"}
          inputRef={(el) =>
            confirm
              ? (confirmInputsRef.current[i] = el)
              : (inputsRef.current[i] = el)
          }
          inputProps={{
            "data-index": i,
            "data-confirm": confirm,
            inputMode: "numeric",
            pattern: "[0-9]*",
            maxLength: 1,
            style: { textAlign: "center", width: 40 },
          }}
          variant="outlined"
          size="small"
        />
      ))}
    </Stack>
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {confirmMode && confirmStep
            ? "Re-enter your PIN to confirm."
            : helperText}
        </Typography>

        {confirmMode && confirmStep
          ? renderInputs(confirmValues, true)
          : renderInputs(values)}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {submitButton && (
          <Button
            color="success"
            variant="contained"
            onClick={doSubmit}
            disabled={
              confirmMode
                ? confirmStep
                  ? values.some((v) => !v) || confirmValues.some((v) => !v)
                  : values.some((v) => !v)
                : values.some((v) => !v)
            }
          >
            {confirmMode && !confirmStep ? "Next" : "Submit"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
