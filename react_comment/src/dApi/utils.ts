import {
  Connection,
  Keypair,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
  PublicKey,
} from '@solana/web3.js';
import {Buffer} from 'buffer';

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
  const instructionFir = Buffer.from(Uint8Array.from([0])); // instruction 0
  const instructionText = Buffer.from(new TextEncoder().encode(text));

  const instructionBuffer = Buffer.concat([instructionFir, instructionText]);
  console.log(instructionBuffer);
  const instruction = new TransactionInstruction({
    keys: [],
    programId: getProgramId(),
    data: instructionBuffer,
  });
  await sendAndConfirmTransaction(
    connection,
    new Transaction().add(instruction),
    [payer],
  );
};

/*

*/
