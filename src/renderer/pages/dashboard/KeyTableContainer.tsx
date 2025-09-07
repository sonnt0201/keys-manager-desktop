import { Alert, Paper, Snackbar, Stack } from "@mui/material"
import { KeysTable } from "./KeyTable"
import { KeyToolbar } from "./KeyToolbar"
import { useEffect, useState } from "react";
import { KeyEditDialog } from "./KeyEditDialog";
import { PinInputDialog } from "@/renderer/components/PinInputDialog";
import { ConfirmDialog } from "@/renderer/components/ConfirmDialog";

// Pending job that's waiting PIN from user input
interface IPendingPINJob {
    createKey?: { serviceName: string; serviceUsername?: string; description?: string; rawKeyValue: string }, // key to be created
    revealKey?: IKeyModel, // key to be revealed
    updateKey?: { id: string, serviceName?: string; serviceUsername?: string; description?: string; rawKeyValue?: string }
}


interface IConfirmDialogControl {
    title: string,
    message: string,
    open: boolean
}

/**
 * Pending job that wait for user's confirmation using {@link ConfirmDialog}
 */
interface IPendingConfirmJob {
    deleteKey?: IKeyModel
}

export const KeyTableContainer = () => {


    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [pinDialogOpen, setPinDialogOpen] = useState(false);

    const [displayedKeys, setDisplayedKeys] = useState<IKeyModel[]>([])
    const [revealedKeys, setRevealedKeys] = useState<{
        id: string,
        decryptedValue: string
    }[]>([])

    const [keyToEdit, setKeyToEdit] = useState<IKeyModel>()

    const [pendingPINJob, setPendingPINJob] = useState<IPendingPINJob[]>([]) // pending job that waiting for PIN from user input before submit to IPC

    const [confirmDialogControl, setConfirmDialogControl] = useState<IConfirmDialogControl>({
        title: "",
        message: "",
        open: false
    })

    /** Pending job that wait for user's confirmation using {@link ConfirmDialog} */
    const [pendingConfirmJob, setPendingConfirmJob] = useState<IPendingConfirmJob>()

    const [notification, setNotification] = useState<string>()
    const [errorNotification, setErrorNotification] = useState<boolean>(false)

    useEffect(() => {
        getKeys();
    }, [])

    useEffect(() => {
        // when keyToEdit is set, means that on going need to open dialog to update key.
        if (keyToEdit) setEditDialogOpen(true)
    }, [keyToEdit])

    useEffect(() => { // when there are pending job(s), open PIN input dialog to get PIN to handle those jobs
        if (pendingPINJob.length > 0) {
            setPinDialogOpen(true)
        }
    }, [pendingPINJob])


    useEffect(() => { // auto hide all revealed key after 30second
        autoHideAllRevealedKeys()
    },[revealedKeys])

    useEffect(() => { // open confirm dialog if having pending confirm job
        if (pendingConfirmJob) {
            setConfirmDialogControl(_ => {


                let title = pendingConfirmJob.deleteKey ? "DELETE THIS KEY?" : ""
                let message = pendingConfirmJob.deleteKey ? `Are you sure to delete your key for "${pendingConfirmJob.deleteKey.serviceName
                    }", this can be undone!` : ""

                // * OPEN AND SET CONFIRM DIALOG'S TITLE AND MESSAGE HERE, IN CASE THERE ARE 
                // * MORE TYPE OF PENDING CONFIRM JOBS IN THE FUTURE
                const newVal: IConfirmDialogControl = {
                    open: true,
                    title: title,
                    message: message
                }

                return newVal
            })
        }
    }, [pendingConfirmJob])

    // auto hide all revealed key after 1 min, should be put in use effect
    const autoHideAllRevealedKeys = () => {
        if (revealedKeys.length === 0) return;

        setTimeout(() => {
            setRevealedKeys([])
            setNotification("Auto hide all revealed keys")
        }, 60_000)
    }

    // do update key for displaying on table
    const getKeys = async () => {
        const keys = await window.ipcRenderer.key.findByCreated({
            mode: "latest",
            limit: 50,

        });

        setDisplayedKeys(keys)
    }

    function doSubmitNewKey(data: { serviceName?: string; serviceUsername?: string; description?: string; rawKeyValue?: string; }) {
        if (!data.serviceName || !data.rawKeyValue) return;

        setEditDialogOpen(false);

        // add create job to pending job
        setPendingPINJob(prev => {
            const newJob: IPendingPINJob = {
                createKey: {
                    serviceName: data.serviceName || "",
                    serviceUsername: data.serviceUsername,
                    description: data.description,
                    rawKeyValue: data.rawKeyValue || "",
                },
            }

            return [...prev, newJob]

        })

        // open dialog to waiting pin from input
        // setPinDialogOpen(true);
    }

    // handle all pending job waiting for PIN from user input, call after retrieved PIN from user
    function handlePinSubmit(pin: string) {
        console.log("PIN submitted: ", pin);
        console.log("Pending Jobs: ", pendingPINJob)
        console.log("Key to edit: ", keyToEdit)



        pendingPINJob.forEach(async job => {

            const pinAuth = await window.ipcRenderer.secondAuth.verify(pin)
            if (pinAuth === "authentication-failed") {
                setErrorNotification(true);
                setNotification("Wrong PIN")
            }
            // console.log("PIN Auth: ", pinAuth)
            try {
                if (job.createKey) {
                    const result = await window.ipcRenderer.key.create(job.createKey, pin)
                    setNotification(`Created a key for "${job.createKey.serviceName}"`)
                    // if (result === "success") getKeys()
                }

                if (job.revealKey) {
                    const result = await window.ipcRenderer.key.decrypt(job.revealKey, pin)
                    if (result.decryptedData) {
                        const newRevealedKey = ({
                            id: job.revealKey?.id,
                            decryptedValue: result.decryptedData
                        })
                        setRevealedKeys(prev => [...prev, newRevealedKey])
                        setNotification(`Revealed key for "${job.revealKey.serviceName}"`)
                    } else {
                        console.log("Result: ", result.result)

                    }
                }

                if (job.updateKey && keyToEdit) {

                    console.log("Updating new key: ", keyToEdit)
                    const result = await window.ipcRenderer.key.update(keyToEdit, job.updateKey, pin)

                    setNotification(`Updated key for "${job.updateKey.serviceName}"`)

                    // console.log(result)
                }

            } catch (e) {
                setErrorNotification(true)
                setNotification(`ERROR HAPPENDED!`)
            }

        })

        // clean pending jobs
        setPendingPINJob([])

        setPinDialogOpen(false);
        getKeys();
    }



    async function doSubmitUpdatedKey(data: { serviceName?: string; serviceUsername?: string | undefined; description?: string | undefined; rawKeyValue?: string; }): Promise<void> {



        if (!keyToEdit) return;

        setEditDialogOpen(false);

        // in case key value is not changed, so dont need pin and pushing to pending job. Just call ipc
        if (!data.rawKeyValue) {
            try {
                const result = await window.ipcRenderer.key.update(keyToEdit, data);
                if (result === "success") setNotification(`Updated key infor for ${data.serviceName || keyToEdit.serviceName}`)
            } catch (e) {
                console.error((e as Error).message)
                setErrorNotification(true)
                setNotification("Error happened!")
            }

            // clean the return right after
            // clean pending jobs
            setPendingPINJob([])

            setPinDialogOpen(false);
            getKeys();

            return;
            
        }


        // Incase key value is changed. Then must send update request with PIN attached. add create job to pending job
        setPendingPINJob(prev => {
            const newJob: IPendingPINJob = {
                updateKey: {
                    id: keyToEdit?.id,
                    ...data
                }
            }


            console.log("new pending job: ", newJob)

            return [...prev, newJob]

        })



        // open dialog to waiting pin from input
        // if (data.rawKeyValue) setPinDialogOpen(true);


    }

    /** 
     * Fired after user click "confirm" button on {@link ConfirmDialog}
     * This do handle the pending job on {@link pendingConfirmJob}
     */
    const handleConfirmDialog = async () => {

        // close the dialog first
        setConfirmDialogControl(prev => {
            const newValue: IConfirmDialogControl = {
                ...prev,
                open: false,
            }
            return newValue
        })
        try {
            // handle by type of job storing in pendingConfirmJob
            if (pendingConfirmJob?.deleteKey) {
                const result = await window.ipcRenderer.key.delete(pendingConfirmJob.deleteKey.id)
                console.log("Delete result: ", result)
                setNotification(`Delete key for "${pendingConfirmJob.deleteKey.serviceName}"`)
            }
        } catch (e) {
            setErrorNotification(true)
            setNotification(`ERROR HAPPENDED!`)
        }


        // clean pending confirm job
        setPendingConfirmJob(undefined)
        getKeys();
    }

    /**  Fired after user click "cancel" button on {@link ConfirmDialog} */
    const handleCancelDialog = () => {
        setConfirmDialogControl(prev => {
            const newValue: IConfirmDialogControl = {
                ...prev,
                open: false,
            }
            return newValue
        })
        setPendingConfirmJob(undefined)
    }

    return (
        <Paper>
            <Stack direction="column" justifyContent="space-between" alignItems="center" />

            <KeyToolbar
                onAddButtonClick={() => {
                    setKeyToEdit(undefined)
                    setEditDialogOpen(true)
                }}
            />

            <KeysTable
                rows={displayedKeys}
                revealedKeys={revealedKeys}
                onShow={(selected) => {

                    const newJob: IPendingPINJob = {
                        revealKey: selected
                    }
                    setPendingPINJob(prev => [...prev, newJob])

                    // setPinDialogOpen(true)

                }}

                onHide={(selected) => {
                    setRevealedKeys(prev => prev.filter(ele => ele.id !== selected.id))
                }}

                onEdit={(selected) => {
                    // just open dialog to edit
                    setKeyToEdit(selected)

                }}

                onDelete={(sel) => {
                    const newJob: IPendingConfirmJob = {
                        deleteKey: sel
                    }
                    setPendingConfirmJob(newJob)
                }}
            />



            <KeyEditDialog
                initialValue={keyToEdit}
                open={editDialogOpen}
                onClose={() => {
                    setEditDialogOpen(false)
                    // clean
                    // setKeyToEdit(undefined)
                }}
                onSubmit={keyToEdit ? doSubmitUpdatedKey : doSubmitNewKey}
            />

            <PinInputDialog
                open={pinDialogOpen}
                hideValue={true}
                onClose={() => setPinDialogOpen(false)}
                onSubmit={handlePinSubmit}
            />

            <ConfirmDialog
                title={confirmDialogControl.title}
                message={confirmDialogControl.message}
                open={confirmDialogControl.open}
                onConfirm={handleConfirmDialog}
                onCancel={handleCancelDialog}
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
        </Paper>
    )
}
