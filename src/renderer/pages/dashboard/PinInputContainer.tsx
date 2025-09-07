import { PinInputDialog } from "@/renderer/components/PinInputDialog"


/**
 * Wrapper for {@link PinInputDialog} but do validating pin input via calling ipc and just notifying correct pin input to parent
 */
export const PinInputContainer = ({
    
}) => {
    return (<>
    <PinInputDialog open={false}/>
    </>)
}