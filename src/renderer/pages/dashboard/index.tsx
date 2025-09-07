import { Box, Fab, Paper, Stack } from "@mui/material";
import { KeysTable } from "./KeyTable";
import { KeyToolbar } from "./KeyToolbar";
import { KeyTableContainer } from "./KeyTableContainer";
import { KeyEditDialog } from "./KeyEditDialog";
// import { PinInputDialog } from "./PinInputDialog";
import AddIcon from '@mui/icons-material/Add';
import FloatingLogoutButton from "./FloatingLogoutButton";
const Entry = () => {


    const doLogout = async () => {
        console.log("Start logging out ...")
        window.ipcRenderer.logout()
        window.location.reload();
    }

    return (<Box 
    >
        <KeyTableContainer />
       <FloatingLogoutButton
       confirm
       position="bottom-right"
       offset={{
        right: 30,
        bottom: 30
       }}
       onLogout={doLogout}
       />
        {/* <KeyEditDialog open={true} /> */}
    </Box>

    )
}

export default Entry;