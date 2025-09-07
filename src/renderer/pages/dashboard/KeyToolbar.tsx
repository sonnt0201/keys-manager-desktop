import { Paper, ButtonGroup, IconButton, Stack, Tooltip, Divider, Typography, FormControlLabel, Switch, Button } from "@mui/material"
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { useState } from "react";
import { VisibilityRounded } from "@mui/icons-material";
export const KeyToolbar = ({
    onAddButtonClick,
    onRevealButtonClick,
    revealing,
    onDeleteButtonClick

}: {
    onAddButtonClick?: () => void;
    onRevealButtonClick?: () => void;
    revealing?: boolean;
    onDeleteButtonClick?: () => void;
}) => {

    // const [revealing, setRevealing] = useState(true);

    return <Paper >
        <Stack direction="row" justifyContent="space-between" alignItems="center" >
            <Typography variant="h6" component="div" marginX={2}>
                Your Keys
            </Typography>
            <Stack direction="row" spacing={1} justifyContent="right" alignItems="center" p={1}
                sx={{ flexGrow: 1, p: 1, pl: 2 }}
            // sx={{ backgroundColor: 'red' }}
            >

                <Tooltip title="Add new key">

                   
                    <Button variant="contained" color="primary" onClick={onAddButtonClick} startIcon={<AddCircleOutlineRoundedIcon />}>
                        New Key
                    </Button>
                </Tooltip>
                {/* <Divider orientation="vertical" flexItem /> */}
                {/* <Tooltip title={revealing ? "Hide" : "Reveal"}>
                        <IconButton color="error" onClick={() => {
                            // setRevealing(!revealing);
                            onRevealButtonClick?.();
                        }}>
                           {revealing && <VisibilityOffRoundedIcon />}
                           {!revealing && <VisibilityRounded />}
                        </IconButton>
                    </Tooltip>
                    <Divider orientation="vertical" flexItem />
                    <Tooltip title="Delete">
                        <IconButton color="error" onClick={onDeleteButtonClick}>
                            <DeleteRoundedIcon />
                        </IconButton>
                    </Tooltip>
                    <Divider orientation="vertical" flexItem /> */}
                {/* <FormControlLabel control={<Switch  />} label="Editable" sx={{marginX: 1}} /> */}
                {/* <Icon */}

            </Stack>

        </Stack>

        {/* <h1>Toolbar</h1> */}

    </Paper>
}