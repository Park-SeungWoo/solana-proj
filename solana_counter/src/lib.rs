// imports
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

pub mod instruction;
use crate::instruction::HelloInstruction;

/*
1. set account
2. set entrypoint
3. program instruction
 */

/// Define the type of state stored in accounts
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct GreetingAccount {
    /// number of greetings
    pub counter: u32,
}

// Declare and export the program's entrypoint
entrypoint!(process_instruction);  // setup our rust code to handle solana smart contract(program)

// Program entrypoint's implementation
/*
3 parameters
1. program id which created by system when deploy.
2. accounts that will be used e.g. in counter example, if can be the counter account like GreetingAccount we declared above.
3. we don't use this parameter in this example, but in more complex program, it tells the program what to do. e.g. In counter example, we can send increment or decrement instruction.
 */
pub fn process_instruction(
    program_id: &Pubkey, // Public key of the account the hello world program was loaded into
    accounts: &[AccountInfo], // The account to say hello to
    instruction_data: &[u8], // Ignored, all helloworld instructions are hellos
) -> ProgramResult {
    msg!("Hello World Rust program entrypoint");  // log
    let instruction = HelloInstruction::unpack(instruction_data)?;  // We promise that rhe result will be success and there might be a value.
    /*
    instruction_data
    5 byte
    [00000000] [00000000 00000000 00000000 00000000]
    first 8bits -> real instruction data that matches with our instruction enum 
    rest 4 parts(32bits) -> set value which has declared as u32
     */

    // Iterating accounts is safer than indexing
    let accounts_iter = &mut accounts.iter();  // accounts is a slice, and it has some methods. This one is iterator like the iterator in vector cpp thogh.

    // Get the account to say hello to
    let account = next_account_info(accounts_iter)?;  // next element in the iterator so the first one now -> first time (it returns a Result obj -> ? means we promise there is not any erorr -> result will must be Ok())

    // The account must be owned by the program in order to modify its data
    if account.owner != program_id {  // maybe the client send the program_id(account) in the accounts parameter, and this line is for checking if it's same between real program_id and the account that recieved as accounts parameter
        msg!("Greeted account does not have the correct program id");
        return Err(ProgramError::IncorrectProgramId);
    }

    // Increment and store the number of times the account has been greeted
    let mut greeting_account = GreetingAccount::try_from_slice(&account.data.borrow())?;
    // note: all the fields such as counter is stored on the solana network, the client code doesn't have access to it.
    match instruction {
        HelloInstruction::Increment => {
            greeting_account.counter += 1;
        },
        HelloInstruction::Decrement => {
            greeting_account.counter -= 1;
        },
        HelloInstruction::Set(val) => {
            greeting_account.counter = val;
        },
        HelloInstruction::Default => {
            greeting_account.counter += 1;
        }
    }
    greeting_account.serialize(&mut &mut account.data.borrow_mut()[..])?;

    msg!("Greeted {} time(s)!", greeting_account.counter);

    Ok(())
}

// Sanity tests
#[cfg(test)]
mod test {
    use super::*;
    use solana_program::clock::Epoch;
    use std::mem;

    #[test]
    fn test_sanity() {
        let program_id = Pubkey::default();
        let key = Pubkey::default();
        let mut lamports = 0;
        let mut data = vec![0; mem::size_of::<u32>()];
        let owner = Pubkey::default();
        let account = AccountInfo::new(
            &key,
            false,
            true,
            &mut lamports,
            &mut data,
            &owner,
            false,
            Epoch::default(),
        );
        let instruction_data: Vec<u8> = Vec::new();

        let accounts = vec![account];

        assert_eq!(
            GreetingAccount::try_from_slice(&accounts[0].data.borrow())
                .unwrap()
                .counter,
            0
        );
        process_instruction(&program_id, &accounts, &instruction_data).unwrap();
        assert_eq!(
            GreetingAccount::try_from_slice(&accounts[0].data.borrow())
                .unwrap()
                .counter,
            1
        );
        process_instruction(&program_id, &accounts, &instruction_data).unwrap();
        assert_eq!(
            GreetingAccount::try_from_slice(&accounts[0].data.borrow())
                .unwrap()
                .counter,
            2
        );
    }
}
