import {Connection, Keypair} from '@solana/web3.js';

export interface IDApi {
  connection: Connection;
  payer: Keypair;
}

export interface ICommentDApi extends IDApi {
  text: string;
}
