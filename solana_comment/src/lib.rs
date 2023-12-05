#![allow(unused)] // disable unsed warnings in this crate

use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};
pub mod accounts;
pub mod instruction;
use accounts::comments::CommentAccount;
use instruction::comment_instruction;

use crate::instruction::comment_instruction::CommentInstruction;

entrypoint!(program_instruction);

pub fn program_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8], // get string data from client
) -> ProgramResult {
    msg!("Hi comment program!");

    let instruction = CommentInstruction::unpack(instruction_data)?;

    let account_iter = &mut accounts.iter();
    let account = next_account_info(account_iter)?;

    if account.owner != program_id {
        return Err(ProgramError::InvalidAccountOwner);
    }

    let mut comment_account = CommentAccount::try_from_slice(&account.data.borrow())?; // deserialization -> get account's current data

    msg!("{:?}", account);

    match instruction {
        CommentInstruction::Add(data) => {
            // comment_account
            //     .comments
            //     .push_str(format!("{}/", data).as_str());
            comment_account
                .comments
                .extend(format!("{}/", data).as_bytes());
            // account.realloc(comment_account.comments.len(), false);
            msg!("{}", data);
            msg!("{:?}", comment_account);
        }
    }

    msg!("{:?}", account);

    msg!("{:?}", account.data.borrow_mut());
    // comment_account.serialize(&mut &mut account.data.borrow_mut()[..])?; // apply data modification  // String is not a best idea -> change the structure to save comment datas.

    Ok(())
}

/* Q1
    How to send string datas via instruction_data?
    00000000 00000000 ...
    first -> instruction
    rest u8 elements -> group 3 consecutive elements and use them as 1 char -> korean words are expressed as 3 bytes in utf-8 encoding
    actually it doesn't matter if it's korean or the other.
    just encode the string by utf-8 and send
    when recieve instruction_data in solana program, split first byte(element e.g. number) and use it as instruction.
    with rest of the data, we can decode it with utf-8 to take out strings.
    we can get string from utf-8 encoded u8 array via String::from_utf8()
*/

/* Q2
    How to store those all comment datas?
    maybe save those as u8 array, and concat with / char or something
    // account size realloc might be good
*/
