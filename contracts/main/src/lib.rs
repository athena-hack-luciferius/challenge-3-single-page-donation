use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::{env, near_bindgen, PanicOnDefault, AccountId};

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    owner: AccountId
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new(owner: AccountId) -> Self {
        Self {
            owner,
        }
    }

    //Just a sample method to play with. Can be deleted
    #[payable]
    pub fn sample_method(&mut self) {
        let deposit = (env::attached_deposit() as f64)/(10u128.pow(24) as f64);
        env::log_str(format!("Thanks for the {} NEAR.", deposit).as_str())
    }
    
    /*
     * This function is helpful for development.
     * Here you can clear all states of the contract
     * in order to delete the contract account.
     * If the contracts state is to big, it is not possible
     * to delete the account later.
     */
    pub fn clear(&mut self) {
        assert_eq!(self.owner, env::predecessor_account_id(), "Only owner can clear the state.");
        //clear all collections and maps here
    }
}

/*
 * the rest of this file sets up unit tests
 * to run these, the command will be:
 * cargo test -- --nocapture
 * Note: 'rust-template' comes from Cargo.toml's 'name' key
 */

// use the attribute below for unit tests
#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::test_utils::{VMContextBuilder};
    //use near_sdk::test_utils::{get_logs, VMContextBuilder};
    use near_sdk::{testing_env, AccountId};

    // part of writing unit tests is setting up a mock context
    // provide a `predecessor` here, it'll modify the default context
    fn get_context(predecessor: AccountId) -> VMContextBuilder {
        let mut builder = VMContextBuilder::new();
        builder.predecessor_account_id(predecessor);
        builder
    }

    #[test]
    fn sample_test() {
        // Get Alice as an account ID
        let alice = AccountId::new_unchecked("alice1.testnet".to_string());
        // Set up the testing context and unit test environment
        let context = get_context(alice.clone());
        testing_env!(context.build());

        // Set up contract object and call the new method
        let mut contract = Contract::new(alice);
        
        //test something with the contract
        contract.clear();
    }
}
