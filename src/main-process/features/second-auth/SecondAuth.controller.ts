import { IPCController, Handle } from "@/ipc/decorators";
import { IpcHandleFn } from "@/ipc/types";
// import { SecondAuthResult } from "./ISecondAuthService";
import { SecondAuthWithPIN } from "./SecondAuthWithPin";

/**
 * IPC Controller for second authentication (PIN-based).
 */
@IPCController({ scope: "singleton", prefix: "second-auth" })
export class SecondAuthController {
  private service = new SecondAuthWithPIN();

  /**
   * Create/register a new second authentication PIN.
   */
  @Handle("create")
  create(_event: any, pin: string): Promise<SecondAuthResult> {
    return this.service.createSecondAuth(pin);
  };

  /**
   * Verify an input PIN against stored credentials.
   */
  @Handle("verify")
  verify(_event : any, pin: string): Promise<SecondAuthResult>  {
    return this.service.verifySecondAuth(pin);
  };

  /**
   * Check if a second auth (PIN) has been set up.
   */
  @Handle("is-available")
  isAvailable (_event: any): Promise<boolean> {
    return this.service.isSecondAuthAvailable();
  };

  /**
   * Remove the existing second auth (PIN).
   */
  @Handle("remove")
  remove (_event: any): Promise<SecondAuthResult> {
    return this.service.removeSecondAuth();
  };
}
