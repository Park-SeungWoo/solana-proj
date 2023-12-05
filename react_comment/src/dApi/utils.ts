import {
  Connection,
  Keypair,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
  PublicKey,
  SystemProgram,
} from '@solana/web3.js';
import {Buffer} from 'buffer';
import * as borsh from 'borsh';

const env = process.env;

export const getSolanaRpcUrl = () => {
  return 'http://localhost:8899';
};

export const getPayer = () => {
  // must get key from phantom or something
  const arr = JSON.parse(env.REACT_APP_PAYER_PRIVATE_KEY!);
  const SECRET_KEY = Uint8Array.from(arr);
  return Keypair.fromSecretKey(SECRET_KEY);
};

export const establishConnection = () => {
  const connection = new Connection(getSolanaRpcUrl(), 'confirmed');
  return connection;
};

export const getProgramId = () => {
  const programId = new PublicKey(env.REACT_APP_HELLOWORLD_PROGRAM_ID!);
  return programId;
};

interface IDApi {
  connection: Connection;
  payer: Keypair;
}

interface ICommentDApi extends IDApi {
  text: string;
}

class CommentAccount {
  comments: string = '';
  constructor(fields: {comments: string} | undefined = undefined) {
    if (fields) {
      this.comments = fields.comments;
    }
  }
}

const CommentSchema = new Map([
  [CommentAccount, {kind: 'struct', fields: [['comments', 'String']]}],
]);

const CommentSize = borsh.serialize(CommentSchema, new CommentAccount()).length;

export const getCommentAccount = async ({connection, payer}: IDApi) => {
  const SEED = env.REACT_APP_COMMENT_ACCOUNT_SEED!;
  const commentPubKey = await PublicKey.createWithSeed(
    payer.publicKey,
    SEED,
    getProgramId(),
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
        lamports: lamport,
        space: CommentSize,
        programId: getProgramId(),
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

  if (accountInfo == null) return 'Comment Account not exists';

  const commentData = borsh.deserialize(
    CommentSchema,
    CommentAccount,
    accountInfo.data,
  );

  console.log(commentData);

  return commentData.comments;
};

export const helloWorldDApi = async ({connection, payer}: IDApi) => {
  const instruction = new TransactionInstruction({
    keys: [],
    programId: getProgramId(),
    data: Buffer.alloc(0),
  });
  await sendAndConfirmTransaction(
    connection,
    new Transaction().add(instruction),
    [payer],
  );
};

export const commentDApi = async ({connection, payer, text}: ICommentDApi) => {
  const instructionFir = Buffer.from(Uint8Array.from([1])); // instruction 0
  const instructionText = Buffer.from(new TextEncoder().encode(text));

  const instructionBuffer = Buffer.concat([instructionFir, instructionText]);

  const pubKey = await getCommentAccount({
    connection: connection,
    payer: payer,
  });

  const instructionTx = new Transaction().add(
    new TransactionInstruction({
      keys: [
        {
          pubkey: pubKey,
          isSigner: false,
          isWritable: true,
        },
      ],
      programId: getProgramId(),
      data: instructionBuffer,
    }),
  );

  await sendAndConfirmTransaction(connection, instructionTx, [payer]);
};
