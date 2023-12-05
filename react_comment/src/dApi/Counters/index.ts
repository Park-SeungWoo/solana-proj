import {
    Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import * as borsh from 'borsh';
import * as BufferLayout from '@solana/buffer-layout'

import {IDApi, ISendInstruction, ISetInstructionProp, IBufferLayout} from './interfaces';
import {CounterAccount, CounterSchema, CounterSize, getCounterProgramId} from './accounts';

const env = process.env;

export const getCounterAccount = async ({connection, payer}: IDApi) => {
  const SEED = env.REACT_APP_COUNTER_ACCOUNT_SEED!;
  const commentPubKey = await PublicKey.createWithSeed(
    payer.publicKey,
    SEED,
    getCounterProgramId(),
  );

  const commentAccount = await connection.getAccountInfo(commentPubKey);

  if (commentAccount == null) {
    // if not exist, create one
    const lamport = await connection.getMinimumBalanceForRentExemption(
      CounterSize,
    ); // must set with account size

    const tx = new Transaction().add(
      SystemProgram.createAccountWithSeed({
        fromPubkey: payer.publicKey,
        basePubkey: payer.publicKey,
        seed: SEED,
        newAccountPubkey: commentPubKey,
        lamports: lamport,
        space: CounterSize,
        programId: getCounterProgramId(),
      }),
    );
    await sendAndConfirmTransaction(connection, tx, [payer]);
  }

  console.log(commentPubKey.toBase58());
  return commentPubKey;
};

export const getCounterData = async ({connection, payer}: IDApi) => {
  const accountInfo = await connection.getAccountInfo(
    await getCounterAccount({connection: connection, payer: payer}),
  );

  if (accountInfo === null) return 0;

  const counterData = borsh.deserialize(
    CounterSchema, 
    CounterAccount,
    accountInfo.data,
  );

  return counterData.counter;
}

export const sendCounterInstruction = async (
  {connection, payer, instructionBuff}: ISendInstruction
)  => {
  const instruction = new TransactionInstruction({
    keys: [{pubkey: await getCounterAccount({connection: connection, payer: payer})
        , isSigner: false, isWritable: true}],
    programId: getCounterProgramId(),
    data: instructionBuff,
  });
  await sendAndConfirmTransaction(
    connection,
    new Transaction().add(instruction),
    [payer],
  );
}

export function createIncInstruction(): Buffer {
  const instruction = Buffer.from(Uint8Array.from([0]));
  return instruction;
}

export function createDecInstruction(): Buffer {
    const instruction = Buffer.from(Uint8Array.from([1]));
  return instruction;

}

export function createSetInstruction({val}: ISetInstructionProp): Buffer {
  const layout = BufferLayout.struct<IBufferLayout>([
    BufferLayout.u8('instruction'),
    BufferLayout.u32('value'),
  ]);
  const data = Buffer.alloc(layout.span);
  layout.encode({instruction: 2, value: val}, data);
  return data;
}