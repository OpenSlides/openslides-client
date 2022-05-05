import { CustomOverlayConfig } from '../../../definitions';

export interface SpinnerConfig extends CustomOverlayConfig {
    /**
     * The spinner-service will automatically detect when OpenSlides is stable. Then a spinner-instance will be hidden.
     * If OpenSlides is already stable, a spinner will not be shown.
     */
    hideWhenStable?: boolean;
    /**
     * Pass a function that returns a promise, which will be executed and await for. After the promise resolved, the
     * current spinner is automatically be hidden.
     */
    hideAfterPromiseResolved?: () => Promise<any>;
}
