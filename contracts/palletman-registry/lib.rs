#![cfg_attr(not(feature = "std"), no_std, no_main)]

/// PalletMan Registry — on-chain saved calls storage.
///
/// Lets any Portaldot account save, retrieve, and delete
/// extrinsic call configurations. Think of it as Postman
/// Collections, but stored on-chain and paid in POT.
#[ink::contract]
mod palletman_registry {
    use ink::prelude::string::String;
    use ink::prelude::vec::Vec;
    use ink::storage::Mapping;

    /// A single saved extrinsic call configuration.
    #[derive(Debug, Clone, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct SavedCall {
        /// User-defined label for this call (e.g. "Send 1 POT to Alice")
        pub name: String,
        /// The pallet name (e.g. "Balances")
        pub pallet: String,
        /// The extrinsic name (e.g. "transfer_keep_alive")
        pub extrinsic: String,
        /// JSON-encoded parameter values (e.g. {"dest":"5GrwvaE...","value":"1000000000000"})
        pub params_json: String,
        /// Block timestamp when the call was saved
        pub saved_at: u64,
    }

    #[ink(storage)]
    pub struct PalletManRegistry {
        /// Maps each account to their list of saved calls
        calls: Mapping<AccountId, Vec<SavedCall>>,
        /// Total number of saves across all users
        total_saves: u64,
    }

    /// Emitted when a user saves a new call configuration.
    #[ink(event)]
    pub struct CallSaved {
        #[ink(topic)]
        caller: AccountId,
        name: String,
        pallet: String,
        extrinsic: String,
    }

    /// Emitted when a user deletes a saved call.
    #[ink(event)]
    pub struct CallDeleted {
        #[ink(topic)]
        caller: AccountId,
        index: u32,
    }

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        IndexOutOfBounds,
    }

    pub type Result<T> = core::result::Result<T, Error>;

    impl PalletManRegistry {
        /// Deploy a new PalletMan Registry.
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                calls: Mapping::default(),
                total_saves: 0,
            }
        }

        /// Save an extrinsic call configuration on-chain.
        ///
        /// Costs a small POT fee (storage deposit). The call is
        /// stored under the caller's account and can be loaded
        /// back in PalletMan at any time.
        #[ink(message)]
        pub fn save_call(
            &mut self,
            name: String,
            pallet: String,
            extrinsic: String,
            params_json: String,
        ) {
            let caller = self.env().caller();
            let timestamp = self.env().block_timestamp();

            let mut user_calls = self.calls.get(caller).unwrap_or_default();
            user_calls.push(SavedCall {
                name: name.clone(),
                pallet: pallet.clone(),
                extrinsic: extrinsic.clone(),
                params_json,
                saved_at: timestamp,
            });
            self.calls.insert(caller, &user_calls);
            self.total_saves = self.total_saves.saturating_add(1);

            self.env().emit_event(CallSaved {
                caller,
                name,
                pallet,
                extrinsic,
            });
        }

        /// Return all saved call configurations for a given account.
        #[ink(message)]
        pub fn get_calls(&self, account: AccountId) -> Vec<SavedCall> {
            self.calls.get(account).unwrap_or_default()
        }

        /// Delete a saved call by its index (0-based).
        #[ink(message)]
        pub fn delete_call(&mut self, index: u32) -> Result<()> {
            let caller = self.env().caller();
            let mut user_calls = self.calls.get(caller).unwrap_or_default();

            let idx = index as usize;
            if idx >= user_calls.len() {
                return Err(Error::IndexOutOfBounds);
            }

            user_calls.remove(idx);
            self.calls.insert(caller, &user_calls);

            self.env().emit_event(CallDeleted {
                caller,
                index,
            });

            Ok(())
        }

        /// Return the number of saved calls for a given account.
        #[ink(message)]
        pub fn call_count(&self, account: AccountId) -> u32 {
            self.calls
                .get(account)
                .map(|v| v.len() as u32)
                .unwrap_or(0)
        }

        /// Return the total number of saves across all accounts.
        #[ink(message)]
        pub fn total_saves(&self) -> u64 {
            self.total_saves
        }
    }

    impl Default for PalletManRegistry {
        fn default() -> Self {
            Self::new()
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        #[ink::test]
        fn save_and_retrieve_call() {
            let mut registry = PalletManRegistry::new();
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();

            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);

            registry.save_call(
                String::from("Send 1 POT"),
                String::from("Balances"),
                String::from("transfer_keep_alive"),
                String::from(r#"{"dest":"5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY","value":"1000000000000"}"#),
            );

            let calls = registry.get_calls(accounts.alice);
            assert_eq!(calls.len(), 1);
            assert_eq!(calls[0].name, "Send 1 POT");
            assert_eq!(calls[0].pallet, "Balances");
            assert_eq!(calls[0].extrinsic, "transfer_keep_alive");
            assert_eq!(registry.call_count(accounts.alice), 1);
            assert_eq!(registry.total_saves(), 1);
        }

        #[ink::test]
        fn delete_call() {
            let mut registry = PalletManRegistry::new();
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();

            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);

            registry.save_call(
                String::from("Call A"),
                String::from("System"),
                String::from("remark"),
                String::from("{}"),
            );
            registry.save_call(
                String::from("Call B"),
                String::from("Balances"),
                String::from("transfer_keep_alive"),
                String::from("{}"),
            );

            assert_eq!(registry.call_count(accounts.alice), 2);

            assert!(registry.delete_call(0).is_ok());
            let calls = registry.get_calls(accounts.alice);
            assert_eq!(calls.len(), 1);
            assert_eq!(calls[0].name, "Call B");
        }

        #[ink::test]
        fn delete_out_of_bounds_returns_error() {
            let mut registry = PalletManRegistry::new();
            assert_eq!(registry.delete_call(99), Err(Error::IndexOutOfBounds));
        }

        #[ink::test]
        fn accounts_are_isolated() {
            let mut registry = PalletManRegistry::new();
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();

            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            registry.save_call(
                String::from("Alice call"),
                String::from("Balances"),
                String::from("transfer_keep_alive"),
                String::from("{}"),
            );

            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.bob);
            let bob_calls = registry.get_calls(accounts.bob);
            assert_eq!(bob_calls.len(), 0);
        }
    }
}
