import { IpcMain, IpcRenderer, WebContents, IpcMessageEvent } from 'electron';
/**
 * For backwards compatibility, event is the (optional) LAST argument to a listener function.
 * This leads to the following verbose overload type for a listener function.
 */
export declare type Listener = {
    (event?: IpcMessageEvent): void;
} | {
    (arg1?: unknown, event?: IpcMessageEvent): void;
} | {
    (arg1?: unknown, arg2?: unknown, event?: IpcMessageEvent): void;
} | {
    (arg1?: unknown, arg2?: unknown, arg3?: unknown, event?: IpcMessageEvent): void;
} | {
    (arg1?: unknown, arg2?: unknown, arg3?: unknown, arg4?: unknown, event?: IpcMessageEvent): void;
} | {
    (arg1?: unknown, arg2?: unknown, arg3?: unknown, arg4?: unknown, arg5?: unknown, event?: IpcMessageEvent): void;
};
export declare type Options = {
    maxTimeoutMs?: number;
};
export default class PromiseIpcBase {
    private eventEmitter;
    private maxTimeoutMs;
    private routeListenerMap;
    private listenerMap;
    constructor(opts: {
        maxTimeoutMs?: number;
    } | undefined, eventEmitter: IpcMain | IpcRenderer);
    send(route: string, sender: WebContents | IpcRenderer, ...dataArgs: unknown[]): Promise<unknown>;
    on(route: string, listener: Listener): PromiseIpcBase;
    off(route: string, listener?: Listener): void;
    removeListener(route: string, listener?: Listener): void;
}
