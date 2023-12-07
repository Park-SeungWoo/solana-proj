import { PublicKey } from '@solana/web3.js';
import * as borsh from 'borsh';

const env = process.env;

export class CommentAccount {
  comments: string = '';
  constructor(fields: { comments: string } | undefined = undefined) {
    if (fields) {
      this.comments = fields.comments;
    }
  }
}

export const CommentSchema = new Map([
  [CommentAccount, { kind: 'struct', fields: [['comments', 'String']] }],
]);

export const CommentSize = borsh.serialize(CommentSchema, new CommentAccount()).length;

export const getCommentProgramId = () => {
  const programId = new PublicKey(env.REACT_APP_COMMENT_PROGRAM_ID!);
  return programId;
};

/**  우선 이거 하고, 된다면 아래로 진행
 * Article:
 *  url: String,
 *  comments: [
 *    {
 *      user: String,  // nickname input
 *      comment: String
 *    },
 *    ...
 *  ]
 *
 * 이렇게 구조 잡고 만들기
 */

/**
 * Article: {
 *  url: String,
 *  comments: [
 *    {
 *      user: User struct,
 *      comment: String
 *    },
 *    ...
 *  ]
 * }
 *
 * User: {
 *  account: PubKey,
 *  nickname: String
 * }
 *
 * 이렇게 구조 잡고 만들기
 */
