#![allow(unused)]  // disable unsed warnings in this crate

use borsh::BorshDeserialize;
use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    msg
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
    instruction_data: &[u8],  // get string data from client
) -> ProgramResult {
    msg!("Hi comment program!");
    let instruction = CommentInstruction::unpack(instruction_data).unwrap();

    match instruction {
        CommentInstruction::Add(data) => {
            msg!("{}", data);
        }
    }

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
*/