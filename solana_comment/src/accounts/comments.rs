use std::array;

use borsh_derive::{BorshDeserialize, BorshSerialize};
use solana_program::pubkey::Pubkey;

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct CommentAccount {
    pub comments: String
}