const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CredoChain", function () {
  let CredoChain, credoChain, owner, addr1, addr2;

  beforeEach(async function () {
    // Get contract factory and signers
    CredoChain = await ethers.getContractFactory("CredoChain");
    [owner, addr1, addr2, _] = await ethers.getSigners();

    // Deploy contract and wait for finalization
    credoChain = await CredoChain.deploy();
    await credoChain.waitForDeployment();
  });
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
});