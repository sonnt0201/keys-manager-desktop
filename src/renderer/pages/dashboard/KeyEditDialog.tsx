import * as React from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  FormControl,
  Box,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

interface KeyEditDialogProps {
  open: boolean;
  initialValue?: Partial<IKeyModel>; // for edit mode, prefill
  onClose?: () => void;
  onSubmit?: (data: {
    serviceName?: string;
    serviceUsername?: string;
    description?: string;
    rawKeyValue?: string;
  }) => void;
}

export const KeyEditDialog: React.FC<KeyEditDialogProps> = ({
  open,
  initialValue = {},
  onClose,
  onSubmit,
}) => {
  const [serviceName, setServiceName] = React.useState(initialValue.serviceName || "");
  const [serviceUsername, setServiceUsername] = React.useState(initialValue.serviceUsername || "");
  const [description, setDescription] = React.useState(initialValue.description || "");
  const [rawKeyValue, setRawKeyValue] = React.useState("");
  const [confirmKeyValue, setConfirmKeyValue] = React.useState("");

  const [showRawKey, setShowRawKey] = React.useState(false);
  const [showConfirmKey, setShowConfirmKey] = React.useState(false);
  const [enableKeyValueTextField, setEnableKeyValueTextField] = React.useState<boolean>(true)


  React.useEffect(() => {
    console.log("initial value: ",initialValue )
    if (!open) return;
   
      setServiceName("")
      setServiceUsername("")
      setDescription("")
      setRawKeyValue('')
      setConfirmKeyValue("")
  

    if (initialValue.id) {
      setEnableKeyValueTextField(false)
      setServiceName(initialValue.serviceName || "")
      setServiceUsername(initialValue.serviceUsername || "")
      setDescription(initialValue.description || "")
      
    }

  
  },[open])

  // React.useEffect(() => {

  //   if (initialValue && initialValue.encryptedValue && !enableKeyValueTextField) {
  //     setRawKeyValue("*****************************************")
  //     setConfirmKeyValue("*****************************************")
  //   }
  // }, [initialValue, enableKeyValueTextField, open])
  //  React.useEffect(() => {
  //   // reset form when initialValue changes
  //   setServiceName(initialValue.serviceName || "");
  //   setServiceUsername(initialValue.serviceUsername || "");
  //   setDescription(initialValue.description || "");
  //   setRawKeyValue("");
  //   setConfirmKeyValue("");
  // }, [initialValue, open]);

  const handleSubmit = (event: React.FormEvent) => {

    console.log("Submit button clicked")

    event.preventDefault();
    if (disableSubmit) {
      console.log("submit disabled !")
      return;
    }

  

    onSubmit?.({
      serviceName,
      serviceUsername,
      description,
      rawKeyValue : enableKeyValueTextField ? rawKeyValue : undefined,
    });
    onClose?.();
  };

  const disableSubmit = enableKeyValueTextField && ( !serviceName || !rawKeyValue || (rawKeyValue !== confirmKeyValue));

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialValue?.id ? "Edit Key" : "Add New Key"}</DialogTitle>
      <Box component={"form"} onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            label="Service Name"
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            fullWidth
            required
            margin="dense"
          />
          <TextField
            label="Service Username"
            value={serviceUsername}
            onChange={(e) => setServiceUsername(e.target.value)}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            margin="dense"
          />

          {initialValue?.id && <FormControlLabel control={<Switch
            value={enableKeyValueTextField}
          onChange={(_, value) => {
            setEnableKeyValueTextField(value)
          }}
          />} label="Change the key value" sx={{ marginX: 1 }} />
          }

          <TextField
          disabled= {!enableKeyValueTextField}
            label="Key Value"
            type={showRawKey ? "text" : "password"}
            value={rawKeyValue}
            onChange={(e) => setRawKeyValue(e.target.value)}
            fullWidth
            required = {enableKeyValueTextField}
            error={disableSubmit}
            helperText={enableKeyValueTextField && disableSubmit && !rawKeyValue ? "Key value is required" : ""}
            margin="dense"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowRawKey((prev) => !prev)}>
                    {showRawKey ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
          disabled = {!enableKeyValueTextField}
            label="Confirm Key Value"
            type={showConfirmKey ? "text" : "password"}
            value={confirmKeyValue}
            onChange={(e) => setConfirmKeyValue(e.target.value)}
            fullWidth
            required = {enableKeyValueTextField}
            error={disableSubmit}
            margin="dense"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirmKey((prev) => !prev)}>
                    {showConfirmKey ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}

            helperText={(() => {
              // if (!confirmKeyValue) return "Please confirm the key value";
              if (enableKeyValueTextField && rawKeyValue !== confirmKeyValue) return "Key values do not match";
              return "";
            })()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained"

            disabled={disableSubmit}
          >
            {initialValue?.id ? "Save" : "Add"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
