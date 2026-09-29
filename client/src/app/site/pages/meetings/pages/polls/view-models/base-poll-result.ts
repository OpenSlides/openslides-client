import { djb2hash } from '@app/infrastructure/utils';
import { isFqid } from '@app/infrastructure/utils/transform-functions';

import { BasePollConfigViewModel } from './base-poll-config-view-model';

export abstract class BasePollResult<C extends BasePollConfigViewModel = any, T = any> {
    public total_ballots: number;
    public invalid?: number;

    public constructor(
        public config: C,
        input: Partial<T>
    ) {
        Object.assign(this, this.resolveKeys(config, input));
    }

    protected resolveKeys(config: C, input: Partial<T>): Partial<T> {
        const options = config.poll?.options;
        if (options) {
            for (const key of Object.keys(input)) {
                if (key.startsWith(`text`)) {
                    const keyParts = key.split('-');
                    const option = options.find(o => djb2hash(o.text) === keyParts[1]);
                    if (option) {
                        input[option.id.toString()] = input[key];
                        delete input[key];
                    }
                } else if (isFqid(key)) {
                    const option = options.find(o => o.content_object_id === key);
                    if (option) {
                        input[option.id.toString()] = input[key];
                        delete input[key];
                    }
                }
            }
        }

        return input;
    }
}
