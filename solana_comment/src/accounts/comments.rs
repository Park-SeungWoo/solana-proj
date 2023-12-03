use borsh_derive::{BorshDeserialize, BorshSerialize};

#[derive(BorshDeserialize, BorshSerialize, Debug)]
pub struct CommentAccount {
    pub comments: u8
}