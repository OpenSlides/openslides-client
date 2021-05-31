export enum ErrorType {
    Client,
    Server, // or network errors, they are the same.
    Unknown
}
export function verboseErrorType(type: ErrorType): string {
    switch (type) {
        case ErrorType.Client:
            return 'Client';
        case ErrorType.Server:
            return 'Server';
        case ErrorType.Unknown:
            return 'Unknown';
    }
}

export interface CommunicationError {
    type: string;
    msg: string;
}
export function isCommunicationError(obj: any): obj is CommunicationError {
    const _obj = obj as CommunicationError;
    return typeof obj === 'object' && typeof _obj.msg === 'string' && typeof _obj.type === 'string';
}
export interface CommunicationErrorWrapper {
    error: CommunicationError;
}
export function isCommunicationErrorWrapper(obj: any): obj is CommunicationErrorWrapper {
    return typeof obj === 'object' && isCommunicationError(obj.error);
}
export type ErrorHandler = (type: ErrorType, error: CommunicationError, message: string) => void;
