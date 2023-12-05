import {
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import * as borsh from 'borsh';

import {IDApi, ICommentDApi} from '@dApi/Comments/interfaces';
import {CommentAccount, CommentSchema, CommentSize, getCommentProgramId} from './accounts';

const env = process.env;

export const getCommentAccount = async ({connection, payer}: IDApi) => {
  const SEED = env.REACT_APP_COMMENT_ACCOUNT_SEED!;
  const commentPubKey = await PublicKey.createWithSeed(
    payer.publicKey,
    SEED,
    getCommentProgramId(),
  );

  const commentAccount = await connection.getAccountInfo(commentPubKey);

  if (commentAccount == null) {
    // if not exist, create one
    const lamport = await connection.getMinimumBalanceForRentExemption(
      CommentSize,
    ); // must set with account size

    const tx = new Transaction().add(
      SystemProgram.createAccountWithSeed({
        fromPubkey: payer.publicKey,
        basePubkey: payer.publicKey,
        seed: SEED,
        newAccountPubkey: commentPubKey,
        // lamports: lamport,
        lamports: 10000000,
        space: CommentSize,
        programId: getCommentProgramId(),
      }),
    );
    await sendAndConfirmTransaction(connection, tx, [payer]);
  }

  return commentPubKey;
};

export const getCommentData = async ({connection, payer}: IDApi) => {
  const accountInfo = await connection.getAccountInfo(
    await getCommentAccount({connection: connection, payer: payer}),
  );

  if (accountInfo === null) return 'Comment Account not exists';

  const commentData = borsh.deserialize(
    CommentSchema,
    CommentAccount,
    accountInfo.data,
  );

  console.log(commentData);

  return commentData.comments;
};

export const sendCommentToSolanaNet = async ({
  connection,
  payer,
  text,
}: ICommentDApi) => {
  const instructionFir = Buffer.from(Uint8Array.from([1])); // instruction 0
  const instructionText = Buffer.from(new TextEncoder().encode(text));

  const instructionBuffer = Buffer.concat([instructionFir, instructionText]);

  const pubKey = await getCommentAccount({
    connection: connection,
    payer: payer,
  });

  console.log(pubKey.toBase58());

  const instructionTx = new Transaction().add(
    new TransactionInstruction({
      keys: [
        {
          pubkey: pubKey,
          isSigner: false,
          isWritable: true,
        },
      ],
      programId: getCommentProgramId(),
      data: instructionBuffer,
    }),
  );

  await sendAndConfirmTransaction(connection, instructionTx, [payer]);
};
