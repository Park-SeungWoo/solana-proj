import {PublicKey} from '@solana/web3.js';
import * as borsh from 'borsh';

const env = process.env;

export class CommentAccount {
  comments: string = '';
  constructor(fields: {comments: string} | undefined = undefined) {
    if (fields) {
      this.comments = fields.comments;
    }
  }
}

export const CommentSchema = new Map([
  [CommentAccount, {kind: 'struct', fields: [['comments', 'String']]}],
]);

export const CommentSize = borsh.serialize(
  CommentSchema,
  new CommentAccount(),
).length;

export const getCommentProgramId = () => {
  const programId = new PublicKey(env.REACT_APP_COMMENT_PROGRAM_ID!);
  return programId;
};