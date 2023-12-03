import {useRef} from 'react';
import {
  getPayer,
  establishConnection,
  helloWorldDApi,
  commentDApi,
} from './dApi/utils';

const App = () => {
  const inputRef: React.RefObject<HTMLInputElement> =
    useRef<HTMLInputElement>(null);

  const testUtils = async () => {
    const conn = establishConnection();
    const payer = getPayer();
    // await helloWorldDApi({connection: conn, payer: payer});
    await commentDApi({
      connection: conn,
      payer: payer,
      text: inputRef.current!.value,
    });
    console.log('send transaction');
  };

  return (
    <>
      <h1>Solana Comment Ex</h1>
      <hr />
      <p>add comments</p>
      <input ref={inputRef} />
      <button onClick={testUtils}>send</button>
    </>
  );
};

export default App;
