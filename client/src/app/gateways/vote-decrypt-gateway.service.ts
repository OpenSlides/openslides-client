import { Injectable, Injector } from '@angular/core';
import { curve25519, utils, verify } from '@noble/ed25519';
import { distinctUntilChanged, map, Subscription } from 'rxjs';

import { PollType, VoteValue } from '../domain/models/poll';
import { Deferred } from '../infrastructure/utils/promises';
import { ViewPoll } from '../site/pages/meetings/pages/polls';
import { ORGANIZATION_ID } from '../site/pages/organization/services/organization.service';
import { OrganizationControllerService } from '../site/pages/organization/services/organization-controller.service';
import { PollRepositoryService } from './repositories/polls/poll-repository.service';

interface VoteVerificationData {
    id: number;
    signature: string;
    raws: string;
}

interface CryptoVoteData {
    votes: {
        [id: number]: number | VoteValue;
    };
    token: string;
}

function uInt8Enc(str: string, doAtob = true): Uint8Array {
    const useStr = doAtob ? atob(str) : str;
    return Uint8Array.from(useStr, c => c.charCodeAt(0));
}

@Injectable({
    providedIn: `root`
})
export class VoteDecryptGatewayService {
    public get publicMainKeyFingerprint(): string {
        return this._publicMainKeyString ?? ``;
    }

    private _publicMainKey: Uint8Array;
    private _publicMainKeyString: string;
    private readonly _publicKeySize: number = 32;
    private readonly _nonceSize: number = 12;

    private get repo(): PollRepositoryService {
        if (!this._repo) {
            this._repo = this.injector.get(PollRepositoryService);
        }
        return this._repo;
    }

    private _repo: PollRepositoryService;

    private _lastVoteVerificationData: VoteVerificationData[] = [];
    private _verificationSubscription: Subscription;

    private hasPublicMainKey = new Deferred();

    constructor(private orgaController: OrganizationControllerService, private injector: Injector) {
        this.orgaController.getViewModelObservable(ORGANIZATION_ID).subscribe(organization => {
            if (organization?.vote_decrypt_public_main_key) {
                this._publicMainKey = uInt8Enc(organization?.vote_decrypt_public_main_key);
                console.log(`New public main key is loaded.`);
                this._publicMainKeyString = organization?.vote_decrypt_public_main_key;
                this.hasPublicMainKey.resolve();
            }
        });
    }

    /**
     * Must be called once after the PollRepositoryService is initialized to ensure that the cryptographic poll results get verified.
     */
    public async initialize(): Promise<void> {
        await this.hasPublicMainKey;
        if (this._verificationSubscription) {
            return;
        }
        this._verificationSubscription = this.repo
            .getViewModelListObservable()
            .pipe(
                map(polls =>
                    polls
                        .filter(poll => poll.type === PollType.Cryptographic && poll.votes_raw && poll.votes_signature)
                        .map(poll => {
                            return {
                                id: poll.id,
                                signature: poll.votes_signature,
                                raws: poll.votes_raw,
                                options: poll.options.map(opt => [
                                    opt.yes,
                                    opt.no,
                                    opt.abstain,
                                    opt.votes.flatMap(vot => vot.value)
                                ])
                            } as VoteVerificationData & { options: any };
                        })
                ),
                distinctUntilChanged((prev, curr) => {
                    this._lastVoteVerificationData = prev.map(date =>
                        (({ options, ...others }) => others as VoteVerificationData)(date)
                    );
                    if (prev.length === curr.length && JSON.stringify(prev) === JSON.stringify(curr)) {
                        return true;
                    }
                    return false;
                })
            )
            .subscribe(verificationData =>
                this.updateVerification(
                    verificationData.map(date => (({ options, ...others }) => others as VoteVerificationData)(date))
                )
            );
    }

    public async encryptVote(poll: ViewPoll, vote: string): Promise<string> {
        console.log(`Encrypting vote...`);
        await this.hasPublicMainKey;
        if (!poll.crypt_key || !poll.crypt_signature) {
            throw new Error(`Voting failed: Keys not fully loaded.`);
        }

        const plaintext = new TextEncoder().encode(vote);
        const cryptKey = uInt8Enc(poll.crypt_key);
        const cryptSignature = uInt8Enc(poll.crypt_signature);

        try {
            if (!(await verify(cryptSignature, cryptKey, this._publicMainKey))) {
                throw new Error(`Voting failed: Cryptography keys could not be verified.`);
            }
        } catch (e) {
            throw new Error(`Voting failed: Cryptography keys could not be verified.`);
        }

        const { ephPublKey, sharedSecret } = await this.generateKeysAndSecret(cryptKey);
        const hkdfKey = await this.generateHkdfKey(sharedSecret);

        const nonce = crypto.getRandomValues(new Uint8Array(this._nonceSize));

        const encrypted = new Uint8Array(
            await (crypto.subtle.encrypt({ name: `AES-GCM`, iv: nonce }, hkdfKey, plaintext) as Promise<ArrayBuffer>)
        );
        console.log(`encrypted!`);

        return this.createPayload(ephPublKey, nonce, encrypted);
    }

    public async reVerifyPoll(poll: ViewPoll): Promise<void> {
        const verificationData: VoteVerificationData[] = [
            { id: poll.id, signature: poll.votes_signature, raws: poll.votes_raw }
        ];
        await this.hasPublicMainKey;
        await this.verify(verificationData);
    }

    private async updateVerification(verificationData: VoteVerificationData[]): Promise<void> {
        const prev = this._lastVoteVerificationData.sort((a, b) => a.id - b.id);
        const curr = verificationData.sort((a, b) => a.id - b.id);

        const toUnverify: VoteVerificationData[] = [];
        const toVerify: VoteVerificationData[] = [];
        let x = 0;
        for (let y = 0; y < curr.length; y++) {
            while (prev[x] && prev[x].id < curr[y].id) {
                toUnverify.push(prev[x]);
                x++;
            }
            if (curr[y].id !== prev[x]?.id || JSON.stringify(curr[y]) !== JSON.stringify(prev[x])) {
                toVerify.push(curr[y]);
            }
            if (curr[y].id === prev[x]?.id) {
                x++;
            }
        }
        for (let z = x; z < prev.length; z++) {
            toUnverify.push(prev[z]);
        }

        console.log(`${toVerify.length ? `Verifying ${toVerify.length} polls...` : `No polls to verify.`}`);
        this.verify(toVerify);
        this.unverify(toUnverify);
    }

    private async verify(toVerify: VoteVerificationData[]): Promise<void> {
        const couldntVerify: number[] = [];
        for (let date of toVerify) {
            const model = this.repo.getViewModel(date.id);
            if (!model) {
                couldntVerify.push(date.id);
                continue;
            }
            const signature = uInt8Enc(date.signature);
            const raws = uInt8Enc(date.raws, false);
            let resultVerificationErrors: string[] = [];
            try {
                const verified = await verify(signature, raws, this._publicMainKey);
                resultVerificationErrors = verified ? resultVerificationErrors : [`Signature verification failed`];
            } catch (e) {
                resultVerificationErrors.push(`Signature verification failed with error: "${e.message}"`);
            }
            try {
                resultVerificationErrors = resultVerificationErrors.concat(this.verifyBackendPollResults(model));
            } catch (e) {
                resultVerificationErrors.push(
                    `Comparison between backend and raw poll results failed with error: "${e.message}"`
                );
            }
            this.saveVerificationResult(model, resultVerificationErrors);
        }
        if (couldntVerify.length) {
            console.error(`Couldn't verify the results of the following poll ids: `, couldntVerify.join(`, `));
        }
    }

    private saveVerificationResult(poll: ViewPoll, resultVerificationErrors: string[]): void {
        poll.verified = !resultVerificationErrors.length;
        if (resultVerificationErrors.length) {
            console.warn(
                `Verification of poll ${poll.id}: ${`Failure\nReasons:\n > ${resultVerificationErrors.join(`\n > `)}`}`
            );
            return;
        }
        console.log(`Verification of poll ${poll.id}: ${`Success`}`);
    }

    /**
     * A function that checks if the vote data that is saved in the backend is the same as that in the raw votes.
     * Returns an array of error messages that occured. If the array is empty, everything is alright.
     */
    private verifyBackendPollResults(poll: ViewPoll): string[] {
        const { rawsArray, modelResultsArray } = this.getSortedVoteArrays(poll);
        let invalid = 0;
        let j = 0;
        let errors: string[] = [];
        for (let i = 0; i < modelResultsArray.length; i++) {
            let { raw, cooked, comparison } = this.getDatesAndComparison(rawsArray, j, modelResultsArray, i);
            while (comparison && comparison < 0) {
                if (!/error/.test(JSON.stringify(raw.votes))) {
                    errors.push(`Couldn't find vote from ${raw.token} in the backend`);
                } else {
                    invalid++;
                }
                j++;
                ({ raw, cooked, comparison } = this.getDatesAndComparison(rawsArray, j, modelResultsArray, i));
            }
            if (comparison === undefined || comparison > 0) {
                errors.push(`Couldn't find vote from ${cooked.token} in the raw votes`);
                continue;
            }
            if (this.getSingleVoteResults(raw.votes) !== this.getSingleVoteResults(cooked.votes)) {
                errors.push(`Vote from ${raw.token} was saved differently in backend and raw votes`);
            }
            j++;
        }
        for (let i = j; i < rawsArray.length; i++) {
            if (!/error/.test(JSON.stringify(rawsArray[i].votes))) {
                errors.push(`Couldn't find vote from ${rawsArray[i].token} in the backend`);
            } else {
                invalid++;
            }
        }
        if (invalid !== poll.votesinvalid) {
            errors.push(`Incorrect number of invalid votes`);
        }
        return errors;
    }

    /**
     * When given two CryptoVoteData arrays with an index for each,
     * this function will return both the entries in these indices and a comparison value between the tokens of these entries.
     */
    private getDatesAndComparison(
        rawArray: CryptoVoteData[],
        rawIndex: number,
        cookedArray: CryptoVoteData[],
        cookedIndex: number
    ): { raw: CryptoVoteData; cooked: CryptoVoteData; comparison: number } {
        const raw = rawArray[rawIndex];
        const cooked = cookedArray[cookedIndex];
        return { raw, cooked, comparison: raw?.token.localeCompare(cooked?.token) };
    }

    private getSortedVoteArrays(poll: ViewPoll): { rawsArray: CryptoVoteData[]; modelResultsArray: CryptoVoteData[] } {
        if (!poll.votes_raw) {
            throw new Error(`Couldn't find raw votes.`);
        }
        const rawsArray = (JSON.parse(poll?.votes_raw).votes as CryptoVoteData[]).sort((a, b) =>
            a.token.localeCompare(b.token)
        );
        const modelResults: { [key: string]: [number, VoteValue][] } = {};
        poll.options.forEach(option =>
            option.votes.forEach(vote => {
                modelResults[vote.user_token] = modelResults[vote.user_token]
                    ? modelResults[vote.user_token].concat([[vote.option_id, vote.value]])
                    : [[vote.option_id, vote.value]];
            })
        );
        const modelResultsArray = Object.keys(modelResults)
            .map(token => {
                return {
                    votes: modelResults[token].mapToObject(arr => {
                        return { [arr[0]]: arr[1] };
                    }),
                    token
                } as CryptoVoteData;
            })
            .sort((a, b) => a.token.localeCompare(b.token));
        return { rawsArray, modelResultsArray };
    }

    private getSingleVoteResults(votes: { [id: number]: VoteValue | number }): string {
        let result = {};
        Object.keys(votes)
            .sort()
            .forEach(id => {
                result[id] =
                    typeof votes[id] === `string`
                        ? { [votes[id]]: 1 }
                        : votes[id] === 0
                        ? undefined
                        : { [`Y`]: votes[id] };
            });
        return JSON.stringify(result);
    }

    private unverify(toUnverify: VoteVerificationData[]): void {
        toUnverify.forEach(date => {
            const model = this.repo.getViewModel(date.id);
            if (model) {
                model.verified = undefined;
            }
        });
    }

    private async generateKeysAndSecret(
        cryptKey: Uint8Array
    ): Promise<{ ephPublKey: Uint8Array; sharedSecret: Uint8Array }> {
        const privKey = utils.randomPrivateKey();
        const publKey = curve25519.scalarMultBase(privKey);

        const secret = curve25519.scalarMult(privKey, cryptKey);
        return { ephPublKey: publKey, sharedSecret: secret };
    }

    private async generateHkdfKey(sharedSecret: Uint8Array): Promise<CryptoKey> {
        return crypto.subtle.deriveKey(
            { name: `HKDF`, hash: `SHA-256`, salt: new ArrayBuffer(0), info: new ArrayBuffer(0) },
            await crypto.subtle.importKey(`raw`, sharedSecret.buffer, `HKDF`, false, [`deriveKey`]),
            { name: `AES-GCM`, length: 256 },
            false,
            [`encrypt`]
        );
    }

    private createPayload(ephPublKey: Uint8Array, nonce: Uint8Array, encrypted: Uint8Array): string {
        const payload = new Uint8Array(this._publicKeySize + this._nonceSize + encrypted.length);
        payload.set(ephPublKey.slice(0, this._publicKeySize));
        payload.set(nonce, this._publicKeySize);
        payload.set(encrypted, this._publicKeySize + this._nonceSize);
        return btoa(String.fromCharCode(...payload));
    }
}
