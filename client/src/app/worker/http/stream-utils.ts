export enum ErrorType {
    CLIENT = `Client`,
    SERVER = `Server`, // or network errors, they are the same.
    UNKNOWN = `Unknown`
}

export interface CommunicationError {
    type: string;
    msg: string;
    data?: unknown;
}

export interface CommunicationErrorWrapper {
    error: CommunicationError;
}

export function isCommunicationError(obj: any): obj is CommunicationError {
    const _obj = obj as CommunicationError;
    return obj && typeof obj === `object` && typeof _obj.msg === `string` && typeof _obj.type === `string`;
}

export function isCommunicationErrorWrapper(obj: any): obj is CommunicationErrorWrapper {
    return obj && typeof obj === `object` && isCommunicationError(obj.error);
}

export class ErrorDescription {
    public constructor(
        public readonly type: ErrorType,
        public readonly error: CommunicationError,
        public readonly reason: string
    ) {}
}
