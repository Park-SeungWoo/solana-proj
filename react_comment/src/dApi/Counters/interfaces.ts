import {Connection, Keypair} from '@solana/web3.js';

export interface IDApi {
  connection: Connection;
  payer: Keypair;
}

export interface ISendInstruction extends IDApi {
  instructionBuff: Buffer;
}

export interface ISetInstructionProp {
  val: number;
}

export interface IBufferLayout {
    instruction: number;
    value?: number
}