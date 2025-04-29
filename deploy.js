// scripts/deploy.js

async function main() {
    // Get the contract factory from Hardhat's ethers plugin
    const CredoChain = await ethers.getContractFactory("CredoChain");
    console.log("Deploying CredoChain contract...");
  
    // Deploy the contract
    const credoChain = await CredoChain.deploy();
    // Wait for the deployment to complete
    await credoChain.waitForDeployment();
  
    // Retrieve and log the contract address
    const deployedAddress = await credoChain.getAddress();
    console.log("CredoChain deployed to:", deployedAddress);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Error during deployment:", error);
      process.exit(1);
    });