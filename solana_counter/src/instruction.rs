use std::convert::TryInto;

use solana_program::{msg, program_error::ProgramError};

#[derive(Debug)]
pub enum HelloInstruction {
    Increment,
    Decrement,
    Set(u32),
    Default,
}

impl HelloInstruction {
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        if input.len() == 0 {
            msg!("Execute default instruction");
            return Ok(HelloInstruction::Default);
        }

        msg!("Execute specific instruction");
        let (&tag, rest) = input
            .split_first()
            .ok_or(ProgramError::InvalidInstructionData)?;

        msg!("{} : {:?}", tag, rest);

        match tag {
            0 => return Ok(HelloInstruction::Increment),
            1 => return Ok(HelloInstruction::Decrement),
            2 => {
                if rest.len() != 4 {
                    return Err(ProgramError::InvalidInstructionData);
                }
                let val: Result<[u8; 4], _> = rest[..4].try_into();
                match val {
                    Ok(i) => {
                        return Ok(HelloInstruction::Set(u32::from_le_bytes(i)));
                    }
                    _ => return Err(ProgramError::InvalidInstructionData),
                }
            }
            _ => return Ok(HelloInstruction::Default),
        }
    }
}
/*
instruction_data
5 byte
[00000000] [00000000 00000000 00000000 00000000]
first 8bits -> real instruction data that matches with our instruction enum
rest 4 parts(32bits) -> set value which has declared as u32
    */
