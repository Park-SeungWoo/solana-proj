import { Connection, Keypair, PublicKey } from '@solana/web3.js';

const env = process.env;

const getSolanaRpcUrl = () => {
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
