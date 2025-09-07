import { Handle, IPCController } from "@/ipc/decorators";
import { IIPCControllerV2, IpcHandleFn } from "@/ipc/types";

@IPCController({ scope: "singleton", prefix: "echo" })
class EchoController {

    @Handle("echo")
    async echo(event: Electron.IpcMainInvokeEvent, message: string): Promise<string> {
        return `Hello from main: ${message}`
    }
}