import {useRef} from 'react';
import {
  getPayer,
  establishConnection,
  commentDApi,
  getCommentData,
} from '@dApi/utils';

const App = () => {
  const inputRef: React.RefObject<HTMLInputElement> =
    useRef<HTMLInputElement>(null);

  const testUtils = async () => {
    const conn = establishConnection();
    const payer = getPayer();
    await commentDApi({
      connection: conn,
      payer: payer,
      text: inputRef.current!.value,
    });
    inputRef.current!.value = '';
    console.log('send transaction');

    // const data = await getCommentData({connection: conn, payer: payer});
    // console.log(data);
  };

  return (
    <>
      <h1>Solana Comment Example</h1>
      <hr />
      <p>add comments</p>
      <input ref={inputRef} />
      <button onClick={testUtils}>send</button>
    </>
  );
};
export default App;
