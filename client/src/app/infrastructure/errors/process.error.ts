import { HttpErrorResponse } from '@angular/common/http';
import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';

interface ErrorMessageResponse {
    message: string;
    success: boolean;
}

const isErrorMessageResponse = (obj: any): obj is ErrorMessageResponse =>
    obj &&
    typeof obj === `object` &&
    typeof obj.message === `string` &&
    (obj as ErrorMessageResponse).success === false;

export class ProcessError extends Error {
    public override readonly message: string;
    public readonly status: number;

    public constructor(description: unknown) {
        // Unfortunately, this must be handled before the `super`-call to have the dedicated message.
        const handleErrorDescription = () => {
            let errorStatus = 400;
            let errorMessage: string;
            const getReturnValue = () => ({ message: errorMessage, status: errorStatus });
            // If the error is a string already, return it.
            if (typeof description === `string`) {
                errorMessage = _(description);
                return getReturnValue();
            }

            // If the error is no HttpErrorResponse, it's not clear what is wrong.
            if (!(description instanceof HttpErrorResponse)) {
                console.error(`Unknown error thrown by the http client: `, description);
                errorMessage = _(`An unknown error occurred.`);
                return getReturnValue();
            }

            errorStatus = description.status;

            if (!description.error) {
                errorMessage = _(`The server didn't respond.`);
            } else if (typeof description.error === `object`) {
                if (isErrorMessageResponse(description.error)) {
                    errorMessage = description.error.message;
                } else {
                    const errorList = Object.keys(description.error).map(key => {
                        const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
                        const errorValue = description.error[key];
                        return `${_(capitalizedKey)}: ${errorValue}`;
                    });
                    errorMessage = errorList.join(`, `);
                }
            } else if (typeof description.error === `string`) {
                errorMessage = _(description.error);
            } else if (description.status === 500) {
                errorMessage = _(`A server error occured. Please contact your system administrator.`);
            } else if (description.status > 500) {
                errorMessage = _(`The server could not be reached.`) + ` (${description.status})`;
            } else {
                errorMessage = description.message;
            }

            return getReturnValue();
        };
        const { message, status } = handleErrorDescription();
        super(`${_(`Error`)}: ${message}`);
        this.message = message;
        this.status = status;
    }
}
