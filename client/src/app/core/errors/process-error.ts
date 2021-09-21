import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { HttpErrorResponse } from '@angular/common/http';

interface ErrorMessageResponse {
    message: string;
    success: boolean;
}

function isErrorMessageResponse(obj: any): obj is ErrorMessageResponse {
    return (
        obj &&
        typeof obj === 'object' &&
        typeof obj.message === 'string' &&
        (obj as ErrorMessageResponse).success === false
    );
}

export class ProcessError extends Error {
    public constructor(description: unknown) {
        // Unfortunately, this must be handled before the `super`-call to have the dedicated message.
        const handleErrorDescription = () => {
            let error = _('Error') + ': ';
            // If the error is a string already, return it.
            if (typeof description === 'string') {
                return error + _(description);
            }

            // If the error is no HttpErrorResponse, it's not clear what is wrong.
            if (!(description instanceof HttpErrorResponse)) {
                console.error('Unknown error thrown by the http client: ', description);
                error += _('An unknown error occurred.');
                return error;
            }

            if (!description.error) {
                error += _("The server didn't respond.");
            } else if (typeof description.error === 'object') {
                if (isErrorMessageResponse(description.error)) {
                    error += description.error.message;
                } else {
                    const errorList = Object.keys(description.error).map(key => {
                        const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
                        const message = description.error[key];
                        return `${_(capitalizedKey)}: ${message}`;
                    });
                    error = errorList.join(', ');
                }
            } else if (typeof description.error === 'string') {
                error += _(description.error);
            } else if (description.status === 500) {
                error += _('A server error occured. Please contact your system administrator.');
            } else if (description.status > 500) {
                error += _('The server could not be reached.') + ` (${description.status})`;
            } else {
                error += description.message;
            }

            return error;
        };
        super(handleErrorDescription());
    }
}
