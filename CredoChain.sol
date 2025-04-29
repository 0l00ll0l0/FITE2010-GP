// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title CredoChain: Decentralized Credential Verification System
 * @notice This contract allows approved institutions to issue, revoke, and verify credentials.
 */
contract CredoChain {
    address public owner;
    uint256 public credentialIdCounter;

    // Structure to store credential details
    struct Credential {
        uint256 id;
        address issuer;
        address subject;
        string ipfsHash; // Off-chain detailed data about the credential
        uint256 issuedAt;
        bool revoked;
    }

    // Mapping from credential ID to Credential details
    mapping(uint256 => Credential) public credentials;
    // Mapping from subject address to list of credential IDs
    mapping(address => uint256[]) public subjectCredentials;
    // Mapping to track approved issuers
    mapping(address => bool) public approvedIssuers;

    // Events for off-chain tracking and transparency
    event IssuerAdded(address indexed issuer);
    event IssuerRemoved(address indexed issuer);
    event CredentialIssued(
        uint256 indexed credentialId,
        address indexed issuer,
        address indexed subject,
        string ipfsHash,
        uint256 issuedAt
    );
    event CredentialRevoked(uint256 indexed credentialId, address indexed issuer);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }

    modifier onlyApprovedIssuer() {
        require(approvedIssuers[msg.sender], "Not an approved issuer");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Add an approved issuer. Only the contract owner can execute this.
     * @param _issuer The address of the organization to be approved.
     */
    function addIssuer(address _issuer) external onlyOwner {
        require(_issuer != address(0), "Invalid issuer address");
        approvedIssuers[_issuer] = true;
        emit IssuerAdded(_issuer);
    }

    /**
     * @dev Remove an approved issuer. Only the contract owner can execute this.
     * @param _issuer The address of the organization to be removed.
     */
    function removeIssuer(address _issuer) external onlyOwner {
        require(approvedIssuers[_issuer], "Issuer not approved");
        approvedIssuers[_issuer] = false;
        emit IssuerRemoved(_issuer);
    }

    /**
     * @dev Issue a new credential to a subject. Only approved issuers can call this function.
     * @param _subject The address of the credential holder.
     * @param _ipfsHash The IPFS hash pointing to detailed credential data.
     */
    function issueCredential(address _subject, string memory _ipfsHash) external onlyApprovedIssuer {
        require(_subject != address(0), "Invalid subject address");
        credentialIdCounter++;
        uint256 newCredentialId = credentialIdCounter;

        credentials[newCredentialId] = Credential({
            id: newCredentialId,
            issuer: msg.sender,
            subject: _subject,
            ipfsHash: _ipfsHash,
            issuedAt: block.timestamp,
            revoked: false
        });

        subjectCredentials[_subject].push(newCredentialId);

        emit CredentialIssued(newCredentialId, msg.sender, _subject, _ipfsHash, block.timestamp);
    }

    /**
     * @dev Revoke an existing credential. Only the issuer who issued the credential can revoke it.
     * @param _credentialId The ID of the credential to be revoked.
     */
    function revokeCredential(uint256 _credentialId) external onlyApprovedIssuer {
        Credential storage credential = credentials[_credentialId];
        require(credential.id != 0, "Credential does not exist");
        require(credential.issuer == msg.sender, "Only issuer can revoke");
        require(!credential.revoked, "Credential already revoked");
        
        credential.revoked = true;
        emit CredentialRevoked(_credentialId, msg.sender);
    }

    /**
     * @dev Retrieve all credential IDs associated with a subject.
     * @param _subject The address of the credential holder.
     * @return An array of credential IDs.
     */
    function getCredentialsForSubject(address _subject) external view returns (uint256[] memory) {
        return subjectCredentials[_subject];
    }

    /**
     * @dev Verify the details of a credential.
     * @param _credentialId The ID of the credential to verify.
     * @return The Credential struct containing all details.
     */
    function verifyCredential(uint256 _credentialId) external view returns (Credential memory) {
        Credential memory credential = credentials[_credentialId];
        require(credential.id != 0, "Credential does not exist");
        return credential;
    }
}