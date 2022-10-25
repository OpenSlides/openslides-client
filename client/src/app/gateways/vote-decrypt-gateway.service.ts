import { Injectable, Injector } from '@angular/core';
import { curve25519, utils, verify } from '@noble/ed25519';
import { distinctUntilChanged, map, Subscription } from 'rxjs';

import { PollType } from '../domain/models/poll';
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

function uInt8Enc(str: string, doAtob = true): Uint8Array {
    const useStr = doAtob ? atob(str) : str;
    return Uint8Array.from(useStr, c => c.charCodeAt(0));
}

@Injectable({
    providedIn: `root`
})
export class VoteDecryptGatewayService {
    private _publicMainKey: Uint8Array;
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
                console.log(`NEW publicMainKey: `, this._publicMainKey);
                this.hasPublicMainKey.resolve();
            }
        });
    }

    /**
     * Must be called once after the PollRepositoryService is initialized to ensure that the cryptographic poll results get verified.
     */
    public async initialize(): Promise<void> {
        await this.hasPublicMainKey;
        console.log(`Public main key is loaded.`);
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
                            return { id: poll.id, signature: poll.votes_signature, raws: poll.votes_raw };
                        })
                ),
                distinctUntilChanged((prev, curr) => {
                    this._lastVoteVerificationData = prev;
                    if (prev.length === curr.length && JSON.stringify(prev) === JSON.stringify(curr)) {
                        return true;
                    }
                    return false;
                })
            )
            .subscribe(verificationData => this.updateVerification(verificationData));
    }

    public async encryptVote(poll: ViewPoll, vote: string): Promise<string> {
        console.log(`----------[encryptVote]----------`);
        await this.hasPublicMainKey;
        console.log(`Public main key is loaded.`);
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
        console.log(`verified`);

        const { ephPublKey, sharedSecret } = await this.generateKeysAndSecret(cryptKey);
        const hkdfKey = await this.generateHkdfKey(sharedSecret);

        const nonce = crypto.getRandomValues(new Uint8Array(this._nonceSize));

        const encrypted = new Uint8Array(
            await (crypto.subtle.encrypt({ name: `AES-GCM`, iv: nonce }, hkdfKey, plaintext) as Promise<ArrayBuffer>)
        );
        console.log(`encrypted!`);

        return this.createPayload(ephPublKey, nonce, encrypted);
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

        console.log(`verifying polls...`);
        this.verify(toVerify);
        this.unverify(toUnverify);
    }

    public async reVerifyPoll(poll: ViewPoll): Promise<void> {
        const verificationData: VoteVerificationData[] = [
            { id: poll.id, signature: poll.votes_signature, raws: poll.votes_raw }
        ];
        await this.hasPublicMainKey;
        await this.verify(verificationData);
    }

    private async verify(toVerify: VoteVerificationData[]): Promise<void> {
        const couldntVerify: number[] = [];
        for (let date of toVerify) {
            const model = this.repo.getViewModel(date.id);
            const signature = uInt8Enc(date.signature);
            const raws = uInt8Enc(date.raws, false);
            if (!model) {
                couldntVerify.push(date.id);
            } else {
                try {
                    model.verified = await verify(signature, raws, this._publicMainKey);
                    console.log(`Verified: `, model.id, model.verified);
                } catch (e) {
                    console.warn(`Verification of ${model.id} failed with error: "${e.message}" -> `, false);
                    model.verified = false;
                }
            }
        }
        if (couldntVerify.length) {
            console.error(`Couldn't verify the results of the following poll ids: `, couldntVerify.join(`, `));
        }
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
        console.log(`public key generated`);

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
