use std::{convert::TryInto, string, vec};
use solana_program::{program_error::ProgramError, msg};

#[derive(Debug)]
pub enum CommentInstruction {
    Add(String)
}

impl CommentInstruction {
    pub fn unpack(data: &[u8]) -> Result<Self, ProgramError> {
        if data.len() == 0 {  // if call without any instruction data
            return Err(ProgramError::InvalidInstructionData);
        }
        // parse first 8 bits
        let (&tag, rest) = data.split_first().ok_or(ProgramError::InvalidInstructionData).unwrap();
        // ignore first elem -> later
        // rest => string(utf-8)

        // convert utf encoded u8 array to string
        let vec_str = Vec::from(rest);
        let str_data: String = String::from_utf8(vec_str).unwrap();

        // parse each u32 element to char
        return Ok(CommentInstruction::Add(str_data));
    }
}