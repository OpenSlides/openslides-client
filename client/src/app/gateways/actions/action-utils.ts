export interface ActionRequest {
    action: string;
    data: any[];
}

export interface ActionResponse<T extends {}> {
    success: true;
    message: string;
    results?: ((T | null)[] | null)[];
}

export function isActionResponse<T extends {}>(obj: any): obj is ActionResponse<T> {
    const response = obj as ActionResponse<T>;
    return !!obj && response.success === true && !!response.message;
}

export interface ActionError {
    success: false;
    message: string;
    error_index?: number;
}

export function isActionError(obj: any): obj is ActionError {
    const response = obj as ActionError;
    return !!obj && response.success === false && !!response.message;
}
