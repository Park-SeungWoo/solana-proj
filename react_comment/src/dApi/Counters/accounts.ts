import * as borsh from 'borsh';
import { PublicKey } from '@solana/web3.js';

const env = process.env;

export class CounterAccount {
    counter = 0
    constructor(fields: {counter: number} | undefined = undefined) {
        if (fields) {
          this.counter = fields.counter;
        }
    }   
}

export const CounterSchema = new Map([
    [CounterAccount, {kind: 'struct', fields: [['counter', 'u32']]}],
]);

export const CounterSize = borsh.serialize(
  CounterSchema,
  new CounterAccount(),
).length;

export const getCounterProgramId = () => {
    const programId = new PublicKey(env.REACT_APP_COUNTER_PROGRAM_ID!);
    return programId;
}