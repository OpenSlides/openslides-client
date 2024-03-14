import { HttpStream } from 'src/app/gateways/http-stream';

type AfterEventFn = <T>(stream: HttpStream<T>) => void;

export class StreamHandler<T> {
    public get activeStream(): HttpStream<T> | null {
        return this._currentActiveStream;
    }

    private _currentActiveStream: HttpStream<T> | null = null;
    private _refreshTimer: NodeJS.Timeout | null = null;

    private readonly _afterOpenedFn: AfterEventFn | undefined;
    private readonly _afterClosedFn: AfterEventFn | undefined;

    public constructor(
        private readonly buildStreamFn: () => HttpStream<T>,
        config: {
            afterOpenedFn?: AfterEventFn;
            afterClosedFn?: AfterEventFn;
        } = {}
    ) {
        this._afterOpenedFn = config.afterOpenedFn;
        this._afterClosedFn = config.afterClosedFn;
    }

    public closeCurrentStream(): void {
        const stream = this._currentActiveStream;
        this.destroyStream();
        if (this._refreshTimer) {
            clearInterval(this._refreshTimer);
        }
        if (this._afterClosedFn && stream) {
            this._afterClosedFn(stream);
        }
    }

    public openCurrentStream(): void {
        this.reboot();
        if (!this._refreshTimer) {
            this._refreshTimer = setInterval(() => this.reboot(), 1000 * 60 * 30); // 30 min
        }
        if (this._afterOpenedFn && this._currentActiveStream) {
            this._afterOpenedFn(this._currentActiveStream);
        }
    }

    private reboot(): void {
        this.destroyStream();
        this.openStream();
    }

    private openStream(): void {
        if (!this._currentActiveStream) {
            this.build();
        }
        this._currentActiveStream!.open();
    }

    private destroyStream(): void {
        this._currentActiveStream?.close();
        this._currentActiveStream = null;
    }

    private build(): void {
        this._currentActiveStream = this.buildStreamFn();
    }
}
