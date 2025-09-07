import * as React from "react";
import { Fab, Tooltip, Zoom, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Snackbar, Alert, Box } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";

export type FloatingLogoutButtonProps = {
  /** Triggered after the user confirms logout. Can be async. */
  onLogout: () => Promise<void> | void;
  /** Ask for confirmation before calling onLogout. Default: true */
  confirm?: boolean;
  /** Tooltip label. Default: "Logout" */
  label?: string;
  /** Distance from viewport edges */
  offset?: { bottom?: number; right?: number; left?: number; top?: number };
  /** Position corner. Default: bottom-right */
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  /** Disable the button externally */
  disabled?: boolean;
  /** Optional className for the container */
  className?: string;
};

export default function FloatingLogoutButton({
  onLogout,
  confirm = true,
  label = "Logout",
  offset,
  position = "bottom-right",
  disabled,
  className,
}: FloatingLogoutButtonProps) {
  const [openConfirm, setOpenConfirm] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [snack, setSnack] = React.useState<{ open: boolean; msg: string; severity: "success" | "error" | "info" | "warning" }>({
    open: false,
    msg: "",
    severity: "info",
  });

  const handleClick = () => {
    if (disabled || loading) return;
    if (confirm) setOpenConfirm(true);
    else void doLogout();
  };

  const doLogout = async () => {
    try {
      setLoading(true);
      await onLogout();
      setSnack({ open: true, msg: "Signed out", severity: "success" });
    } catch (err: any) {
      setSnack({ open: true, msg: err?.message || "Logout failed", severity: "error" });
    } finally {
      setLoading(false);
      setOpenConfirm(false);
    }
  };

  const pos = React.useMemo(() => {
    const base = { top: "auto" as const, right: "auto" as const, bottom: "auto" as const, left: "auto" as const };
    const o = { bottom: 24, right: 24, left: 24, top: 24, ...(offset || {}) };
    switch (position) {
      case "bottom-left":
        return { ...base, bottom: o.bottom, left: o.left };
      case "top-right":
        return { ...base, top: o.top, right: o.right };
      case "top-left":
        return { ...base, top: o.top, left: o.left };
      default:
        return { ...base, bottom: o.bottom, right: o.right };
    }
  }, [position, offset]);

  return (
    <>
      <Box
        className={className}
        sx={{ position: "fixed", zIndex: (t) => t.zIndex.tooltip + 1, ...pos }}
      >
        <Tooltip title={label} placement="left" arrow>
          <span>
            <Zoom in>
              <Fab
                color="error"
                aria-label={label}
                onClick={handleClick}
                disabled={!!disabled || loading}
              >
                <LogoutIcon />
              </Fab>
            </Zoom>
          </span>
        </Tooltip>

        {/* Loading overlay dot on top of FAB */}
        {loading && (
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              inset: -2,
              borderRadius: "9999px",
              display: "grid",
              placeItems: "center",
              pointerEvents: "none",
            }}
          >
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: "9999px",
                borderWidth: 2,
                borderStyle: "solid",
                borderColor: "divider",
              }}
            />
          </Box>
        )}
      </Box>

      {/* Confirm dialog */}
      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>Sign out?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You will be signed out from this device.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)} disabled={loading}>Cancel</Button>
          <Button onClick={doLogout} autoFocus color="error" disabled={loading}>
            Logout
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snack feedback */}
      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </>
  );
}

/*
Usage example:

<FloatingLogoutButton
  onLogout={async () => {
    await api.auth.logout();
    // e.g., redirect:
    router.push("/login");
  }}
  confirm
  position="bottom-right"
  offset={{ bottom: 32, right: 32 }}
/>
*/
