import { HttpMethod } from '../../infrastructure/definitions/http';

export class EndpointConfiguration {
    public constructor(public url: string, public healthUrl: string, public method: HttpMethod) {}
}
