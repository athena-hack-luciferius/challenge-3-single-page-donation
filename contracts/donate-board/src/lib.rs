use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::json_types::{U64, U128};
use near_sdk::{env, near_bindgen, PanicOnDefault, AccountId, Promise};
use near_sdk::collections::unordered_map::{UnorderedMap};
use near_sdk::serde::{Deserialize, Serialize};

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    owner: AccountId,
    donation_projects: Vec<DonationData>,
    donations: UnorderedMap<AccountId, Vec<Donation>>
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, BorshDeserialize, BorshSerialize)]
#[serde(crate = "near_sdk::serde")]
pub struct DonationData{
    pub title: String,
    pub description: String,
    pub youtube_stream: String,
    pub donation_target: AccountId,
    pub id: U64,
    pub homepage: String
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, BorshDeserialize, BorshSerialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Donation{
    pub donation: U128,
    pub timestamp: U64,
    pub donation_project: DonationData
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new(owner: AccountId) -> Self {
        Self {
            owner,
            donation_projects: Vec::new(),
            donations: UnorderedMap::new(b"d")
        }
    }

    #[payable]
    pub fn create_donation_project(
        &mut self,
        title: String,
        description: String,
        youtube_stream: String,
        homepage: String
    ) {
        self.donation_projects.push(DonationData { 
            title, 
            description, 
            youtube_stream, 
            donation_target: env::predecessor_account_id(),
            id: env::block_height().into(),
            homepage
        });
    }

    #[payable]
    pub fn delete_donation_project(
        &mut self,
        project_id: U64
    ) {
        let index = self.donation_projects.binary_search_by_key(&project_id, |p| p.id);
        if index.is_ok(){
            assert_eq!(env::predecessor_account_id(), self.donation_projects.get(index.ok().unwrap()).unwrap().donation_target, "Only the donation project owner can delete the project.");
            self.donation_projects.remove(index.ok().unwrap());
        }
    }

    pub fn get_donation_projects(
        &self
    ) -> Vec<DonationData> {
        self.donation_projects.clone()
    }

    #[payable]
    pub fn donate(
        &mut self,
        donation_project: DonationData,
    ) {
        assert!(self.donation_projects.binary_search_by_key(&donation_project.id, |p| p.id).is_ok(), "Invalid donation project.");
        assert!(env::attached_deposit() > 1, "No donation given.");
        Promise::new(donation_project.donation_target.clone()).transfer(env::attached_deposit());
        let mut donations = self.donations.get(&env::predecessor_account_id()).unwrap_or(Vec::new());
        donations.push(Donation { 
            donation: env::attached_deposit().into(), 
            timestamp: env::block_timestamp_ms().into(), 
            donation_project: donation_project 
        });
        self.donations.insert(&env::predecessor_account_id(), &donations);
    }

    pub fn get_donations(
        &self,
        account_id: AccountId
    ) -> Vec<Donation> {
        let result = self.donations.get(&account_id);
        result.unwrap_or(Vec::new())
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
        self.donation_projects.clear();
        self.donations.clear();
    }
}