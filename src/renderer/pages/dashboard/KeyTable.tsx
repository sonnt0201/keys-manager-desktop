import * as React from "react";
import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import { Alert, Box, IconButton, Paper, Snackbar, Stack, Tooltip } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

dayjs.extend(relativeTime);

// Props
interface KeysTableProps {
  rows: IKeyModel[];
  onShow?: (selected: IKeyModel) => void;
  onEdit?: (selected: IKeyModel) => void;
  onDelete?: (selected: IKeyModel) => void;
  onHide?: (selected: IKeyModel) => void;
  revealedKeys?: {
    id: string;
    decryptedValue: string;
  }[];
}

export const KeysTable: React.FC<KeysTableProps> = ({
  rows,
  onShow,
  onEdit,
  onDelete,
  onHide,
  revealedKeys = [],
}) => {
  const [selection, setSelection] =
    React.useState<GridRowSelectionModel>({ type: "include", ids: new Set() });


  const [notification, setNotification] = React.useState<string>()
  const [errorNotification, setErrorNotification] = React.useState<boolean>(false)

  const columns: GridColDef[] = [
    { field: "serviceName", headerName: "Service", flex: 1 },
    { field: "serviceUsername", headerName: "Username", flex: 1 },
    { field: "description", headerName: "Description", flex: 2 },
    {
      field: "encryptedValue",
      headerName: "Key",
      flex: 2,
      renderCell: (params) => {
        const revealed = revealedKeys.find((k) => k.id === params.row.id);

        return revealed ? (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <span style={{ marginRight: 8 }}>{revealed.decryptedValue}</span>
            <Tooltip title="Copy to clipboard">
              <IconButton
                size="small"
                onClick={() => {
                  const value = revealed.decryptedValue;
                  navigator.clipboard.writeText(value);
                  setNotification("Key copied!")
                  // clear clipboard after 30 seconds
                  setTimeout(() => {
                    // only clear if clipboard still contains our value
                    navigator.clipboard.readText().then((text) => {
                      if (text === value) {
                        navigator.clipboard.writeText("");
                      }
                    });
                  }, 30_000);

                }}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          "••••••••"
        );
      },
    },
    {
      field: "createdAt",
      headerName: "Created",
      flex: 1,
      valueFormatter: (value: number) => dayjs().to(dayjs(value)),
    },
    {
      field: "updatedAt",
      headerName: "Updated",
      flex: 1,
      valueFormatter: (value) => dayjs().to(dayjs(value)),
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      filterable: false,
      flex: 1,
      renderCell: (params) => {
        const isRevealed = revealedKeys.some((k) => k.id === params.row.id);
        return (
          <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
            <Stack direction="row" spacing={1}>
              {!isRevealed ? (
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => onShow?.(params.row)}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              ) : (
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => onHide?.(params.row)}
                >
                  <VisibilityOffIcon fontSize="small" />
                </IconButton>
              )}

              <IconButton
                size="small"
                color="info"
                onClick={() => onEdit?.(params.row)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={() => onDelete?.(params.row)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Box>
        );
      },
    },
  ];

  return (<>
    <DataGrid
      autoHeight
      checkboxSelection
      disableRowSelectionOnClick
      rows={rows}
      getRowId={(row) => row.id}
      columns={columns}
      pageSizeOptions={[5, 10, 20]}
      onRowSelectionModelChange={(newSelection) => setSelection(newSelection)}
      rowSelectionModel={selection}
    />
    <Snackbar
      open={notification !== undefined}
      autoHideDuration={6000}

      onClose={() => {
        setErrorNotification(false)
        setNotification(undefined)
      }}
    // message={notification}
    // action={action}
    >

      <Alert
        onClose={() => setNotification(undefined)}
        severity={errorNotification ? "error" : "success"} // 👈 change color here
        sx={{ width: "100%" }}
        variant="filled"
      >
        {notification}
      </Alert>
    </Snackbar>
  </>

  );
};
