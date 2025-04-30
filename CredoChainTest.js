const { expect } = require("chai");
const { ethers, network } = require("hardhat");

describe("CredoChain", function () {
  let CredoChain, credoChain, owner, addr1, addr2, addr3, addr4;

  beforeEach(async function () {
    // Get contract factory and signers
    CredoChain = await ethers.getContractFactory("CredoChain");
    [owner, addr1, addr2, addr3, addr4, _] = await ethers.getSigners();

    // Deploy contract and wait for finalization
    credoChain = await CredoChain.deploy();
    await credoChain.waitForDeployment();
  });

  // ================================ Original Tests ================================
  it("Should set the right owner", async function () {
    expect(await credoChain.owner()).to.equal(owner.address);
  });

  it("Owner can add an approved issuer", async function () {
    await credoChain.addIssuer(addr1.address);
    expect(await credoChain.approvedIssuers(addr1.address)).to.be.true;
  });

  it("Approved issuer can issue a credential", async function () {
    // Add addr1 as an approved issuer
    await credoChain.addIssuer(addr1.address);
  
    // Using addr1 to issue a credential
    const ipfsHash = "QmTestHash";
    await credoChain.connect(addr1).issueCredential(addr2.address, ipfsHash);
  
    // Credential ID should be 1 (using BigInt for comparison)
    const credential = await credoChain.verifyCredential(1);
    expect(credential.id).to.equal(1n);
    expect(credential.issuer).to.equal(addr1.address);
    expect(credential.subject).to.equal(addr2.address);
    expect(credential.ipfsHash).to.equal(ipfsHash);
  });

  it("Issuer can revoke a credential", async function () {
    // Add addr1 as approved issuer and issue a credential.
    await credoChain.addIssuer(addr1.address);
    await credoChain.connect(addr1).issueCredential(addr2.address, "QmTestHash");

    // Revoke the credential
    await credoChain.connect(addr1).revokeCredential(1);
    const credential = await credoChain.verifyCredential(1);
    expect(credential.revoked).to.be.true;
  });

  // ================================ New Tests ================================

  it("Owner can transfer ownership", async function () {
    // Transfer ownership from owner to addr1
    await credoChain.transferOwnership(addr1.address);
    expect(await credoChain.owner()).to.equal(addr1.address);
  });

  it("Owner can renounce ownership", async function () {
    // Renounce ownership so the owner becomes the zero address
    await credoChain.renounceOwnership();
    // Use the literal zero address instead of ethers.constants.AddressZero
    expect(await credoChain.owner()).to.equal("0x0000000000000000000000000000000000000000");
  });

  it("Owner can batch add issuers", async function () {
    // Batch add several issuers using the addIssuers function
    await credoChain.addIssuers([addr1.address, addr2.address, addr3.address]);
    expect(await credoChain.approvedIssuers(addr1.address)).to.be.true;
    expect(await credoChain.approvedIssuers(addr2.address)).to.be.true;
    expect(await credoChain.approvedIssuers(addr3.address)).to.be.true;
  });

  it("Approved issuer can issue a credential with expiry and validate expiry", async function () {
    // Ensure addr1 is an approved issuer
    await credoChain.addIssuer(addr1.address);

    // Get the current block timestamp
    const latestBlock = await ethers.provider.getBlock("latest");
    const currentTimestamp = latestBlock.timestamp;
    const oneDay = 86400; // seconds in one day
    const expiryTimestamp = currentTimestamp + oneDay; // Expires in 1 day

    // Issue a credential with expiry using issueCredentialWithExpiry
    await credoChain.connect(addr1).issueCredentialWithExpiry(addr2.address, "QmExpiryHash", expiryTimestamp);

    // Immediately check that the credential is valid
    let valid = await credoChain.isCredentialValid(1);
    expect(valid).to.be.true;

    // Increase the EVM time by 2 days so it goes past expiry
    await network.provider.send("evm_increaseTime", [2 * oneDay]);
    await network.provider.send("evm_mine");

    // Check that the credential is now considered invalid (expired)
    valid = await credoChain.isCredentialValid(1);
    expect(valid).to.be.false;
  });

  it("Can fetch credentials by issuer", async function () {
    // Add addr1 as an approved issuer and issue two credentials
    await credoChain.addIssuer(addr1.address);
    await credoChain.connect(addr1).issueCredential(addr2.address, "QmHash1");
    await credoChain.connect(addr1).issueCredential(addr3.address, "QmHash2");

    // Retrieve credentials issued by addr1 using getCredentialsByIssuer
    const issuerCreds = await credoChain.getCredentialsByIssuer(addr1.address);
    expect(issuerCreds.length).to.equal(2);
    expect(issuerCreds[0]).to.equal(1n);
    expect(issuerCreds[1]).to.equal(2n);
  });

  it("Should return total number of credentials", async function () {
    // Add issuer and issue multiple credentials
    await credoChain.addIssuer(addr1.address);
    await credoChain.connect(addr1).issueCredential(addr2.address, "QmHash1");
    await credoChain.connect(addr1).issueCredential(addr2.address, "QmHash2");

    // Use getTotalCredentials to check the count
    const total = await credoChain.getTotalCredentials();
    // Expect to compare using a BigInt (2n) rather than a number (2)
    expect(total).to.equal(2n);
  });
});
