# FITE2010-GP

## Project Overview: CredoChain

CredoChain is a decentralized credential verification system. Approved organizations can issue, revoke, and verify credentials on the blockchain. This project demonstrates smart contract development with Solidity and provides a detailed interaction script using Hardhat and ethers.js.

## Project Implementation Steps:
(Please note that we are using the course docker container)

1. Run the docker container in Docker Desktop

2. Open a terminal and run the command `docker exec -it 2025lab1 bash`, this attaches your terminal to the running container.

3. Create the project folder: Inside the terminal, execute `mkdir CredoChain` and `cd CredoChain`.

4. Initialize the project: Inside the Credochain folder, run `npm init` to initiate the project, press "Enter/Return" for all prompts until completion.

5. Install the necessary packages: Use command `npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox@5.0.0` to install neccessary packages for this project.

6. Set up Hardhat configuration:: Run `npx hardhat` and choose "Create an empty hardhat.config.js".

7. Create the required folders and files: Execute `mkdir contracts scripts test` and `touch contracts/CredoChain.sol scripts/deploy.js scripts/interact.js test/CredoChainTest.js` to create the neccessary folders and files. The workspace structure should be as follows:

```
CredoChain/
├── contracts/
│   └── CredoChain.sol
├── scripts/
│   ├── deploy.js
│   └── interact.js
├── test/
│   └── CredoChainTest.js
├── hardhat.config.js
├── package-lock.json
├── package.json
└── node_modules/
```

8. Populate the project files: Open the files using VS Code or any editor and copy the provided contents to their respective files.

9. Start the local Ethereum blockchain: In the terminal, run `npx hardhat node` to start a local Ethereum blockchain.

10. Open a second terminal: This terminal will be used for compiling and deploying the contracts.

11. Attach to the container in the new terminal: Run `docker exec -it 2025lab1 bash` and then `cd CredoChain`.

12. Compile and deploy: First, compile the contracts with `npx hardhat compile`, and then deploy the contract using `npx hardhat run scripts/deploy.js --network localhost`, after running this command, the terminal will display 
"Deploying CredoChain contract...
 CredoChain deployed to: Your_Contract_Address"
Please copy the value of "Your_Contract_Address" to line 6 of interact.js.

13. Run the tests: Execute `npx hardhat test`. This command runs all tests in the test folder, and you should see that all tests pass.

14. Interact with the Deployed Contract: Finally, we can run the interaction script to see detailed step-by-step operation by command `npx hardhat run scripts/interact.js --network localhost`. 
