import { ICCStream } from './icc-stream';

export class ICCStreamPool {
    public openNewStream(): ICCStream {
        const stream = new ICCStream();
        return stream;
    }
}
