// scripts/interact.js

async function main() {
  console.log("==============================================");
  console.log("        Starting interact.js script           ");
  console.log("==============================================");

  // Please change the below contract address to match your deployed contract address.
  const contractAddress = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";
  console.log("Step 1: Using deployed contract address:", contractAddress);

  const CredoChain = await ethers.getContractFactory("CredoChain");
  console.log("Step 2: Acquired CredoChain contract factory.");

  const credoChain = await CredoChain.attach(contractAddress);
  console.log("Step 3: Connected to the deployed CredoChain contract.");

  const owner = await credoChain.owner();
  console.log("Step 4: Contract Owner is:", owner);

  console.log("Step 5: Adding owner as an approved issuer...");
  let tx = await credoChain.addIssuer(owner);
  await tx.wait();
  console.log("Approved issuer added:", owner);

  // For demonstration, we add the owner and two additional addresses from the signer list.
  const signers = await ethers.getSigners();
  const addr1 = signers[1].address;
  const addr2 = signers[2].address;
  console.log("Step 6: Batch adding multiple approved issuers:", owner, addr1, addr2);
  tx = await credoChain.addIssuers([owner, addr1, addr2]);
  await tx.wait();
  console.log("Batch add issuers completed.");

  const subjectAddress = "0x1234567890123456789012345678901234567890"; // Example subject address.
  const ipfsHash = "QmTestCredentialHash";
  console.log(`Step 7: Issuing non-expiring credential for subject ${subjectAddress} with IPFS hash: ${ipfsHash}...`);
  tx = await credoChain.issueCredential(subjectAddress, ipfsHash);
  await tx.wait();
  console.log(`Non-expiring credential issued for subject ${subjectAddress}.`);

  const oneDay = 86400;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const expiryTimestamp = currentTimestamp + oneDay;
  const ipfsExpiryHash = "QmExpiryHash";
  console.log(`Step 8: Issuing credential with expiry for subject ${subjectAddress} with expiry timestamp: ${expiryTimestamp}...`);
  tx = await credoChain.issueCredentialWithExpiry(subjectAddress, ipfsExpiryHash, expiryTimestamp);
  await tx.wait();
  console.log("Credential with expiry issued.");

  console.log("Step 9: Retrieving details for credential ID 2...");
  let credential = await credoChain.verifyCredential(2);
  const readableCredential = {
    id: credential.id.toString(),
    issuer: credential.issuer,
    subject: credential.subject,
    ipfsHash: credential.ipfsHash,
    issuedAt: new Date(Number(credential.issuedAt) * 1000).toLocaleString(),
    expiresAt: credential.expiresAt === 0 ? "Never" : new Date(Number(credential.expiresAt) * 1000).toLocaleString(),
    revoked: credential.revoked
  };
  console.log("Credential details (ID 2):", readableCredential);

  console.log("Step 10: Checking if credential ID 2 is valid...");
  let valid = await credoChain.isCredentialValid(2);
  console.log("Credential valid (before expiry):", valid);

  console.log("Step 11: Retrieving credentials issued by", owner, "...");
  const issuerCreds = await credoChain.getCredentialsByIssuer(owner);
  console.log("Credentials by issuer:", issuerCreds.map(c => c.toString()));

  console.log("Step 12: Retrieving total number of credentials issued...");
  let total = await credoChain.getTotalCredentials();
  console.log("Total credentials:", total.toString());

  console.log("Step 13: Transferring contract ownership to:", addr1);
  tx = await credoChain.transferOwnership(addr1);
  await tx.wait();
  let newOwner = await credoChain.owner();
  console.log("New contract owner after transfer:", newOwner);

  // For demonstration, we simulate addr1 renouncing ownership.
  console.log("Step 14: Renouncing contract ownership from address:", addr1);
  const credoChainFromAddr1 = await credoChain.connect(signers[1]); // using addr1
  tx = await credoChainFromAddr1.renounceOwnership();
  await tx.wait();
  newOwner = await credoChain.owner();
  console.log("Contract owner after renouncement is:", newOwner);

  console.log("==============================================");
  console.log("   All steps executed successfully!         ");
  console.log("==============================================");
}

main()
.then(() => process.exit(0))
.catch((error) => {
  console.error("Error interacting with the contract:", error);
  process.exit(1);
});