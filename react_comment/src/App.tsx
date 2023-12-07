import { useEffect, useRef, useState } from 'react';
import { getPayer, establishConnection } from '@dApi/utils';
import { sendCommentToSolanaNet } from '@dApi/Comments';
import {
  sendCounterInstruction,
  createIncInstruction,
  createDecInstruction,
  getCounterData,
  createSetInstruction,
} from '@dApi/Counters';
import { Connection, Keypair } from '@solana/web3.js';

interface ICounterProps {
  instruction: number;
  value?: number;
}

const App = () => {
  const inputRef: React.RefObject<HTMLInputElement> = useRef<HTMLInputElement>(null);
  const [count, setCount] = useState<number>(0);
  const [conn, setConn] = useState<Connection>(establishConnection());
  const [payer, setPayer] = useState<Keypair>(getPayer());

  const testUtils = async () => {
    await sendCommentToSolanaNet({
      connection: conn,
      payer: payer,
      text: inputRef.current!.value,
    });
    inputRef.current!.value = '';
    console.log('send transaction');

    // const data = await getCommentData({connection: conn, payer: payer});
    // console.log(data);
  };

  const countProgram = async ({ instruction, value }: ICounterProps) => {
    let instructionBuff;

    switch (instruction) {
      case 0:
        instructionBuff = createIncInstruction();
        break;
      case 1:
        instructionBuff = createDecInstruction();
        break;
      case 2:
        instructionBuff = createSetInstruction({ val: value! });
        break;
      default:
        instructionBuff = Buffer.alloc(0);
    }

    await sendCounterInstruction({
      connection: conn,
      payer: payer,
      instructionBuff: instructionBuff,
    });
    setCounterData();
  };

  const setCounterData = async () => {
    getCounterData({ connection: conn, payer: payer }).then((data) => {
      setCount(data);
    });
  };

  useEffect(() => {
    // get initial count value, set
    setCounterData();
  }, []);

  return (
    <>
      <h1>Solana Comment Example</h1>
      <hr />
      <p>add comments</p>
      <input ref={inputRef} />
      <button onClick={testUtils}>send</button>
      <div>
        {count}
        <button onClick={() => countProgram({ instruction: 0 })}>up</button>
        <button onClick={() => countProgram({ instruction: 1 })}>down</button>
        <button onClick={() => countProgram({ instruction: 2, value: 50504 })}>set</button>
      </div>
    </>
  );
};
export default App;
