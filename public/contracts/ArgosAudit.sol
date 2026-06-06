// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ArgosAudit
 * @notice Immutable on-chain attestation registry for ARGOS events.
 *         Stores event hashes with metadata so the Audit Trail page
 *         can verify proofs on-chain.
 */
contract ArgosAudit {
    struct Attestation {
        bytes32 eventHash;
        string  eventType;   // "Trade Executed", "Index Created", etc.
        string  summary;
        address attestedBy;
        uint256 timestamp;
    }

    // attestationId => Attestation
    mapping(uint256 => Attestation) public attestations;
    uint256 public attestationCount;

    // Authorised attesters (owner can add/remove)
    address public owner;
    mapping(address => bool) public attesters;

    event Attested(
        uint256 indexed id,
        bytes32 indexed eventHash,
        string  eventType,
        address attestedBy,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyAttester() {
        require(attesters[msg.sender] || msg.sender == owner, "Not attester");
        _;
    }

    constructor() {
        owner = msg.sender;
        attesters[msg.sender] = true;
    }

    function addAttester(address _attester) external onlyOwner {
        attesters[_attester] = true;
    }

    function removeAttester(address _attester) external onlyOwner {
        attesters[_attester] = false;
    }

    /**
     * @notice Record an ARGOS event on-chain.
     * @param eventHash  keccak256 of the event payload (JSON stringified)
     * @param eventType  Human-readable event category
     * @param summary    Short description
     * @return id        The attestation ID
     */
    function attest(
        bytes32 eventHash,
        string calldata eventType,
        string calldata summary
    ) external onlyAttester returns (uint256 id) {
        id = attestationCount++;
        attestations[id] = Attestation({
            eventHash:  eventHash,
            eventType:  eventType,
            summary:    summary,
            attestedBy: msg.sender,
            timestamp:  block.timestamp
        });
        emit Attested(id, eventHash, eventType, msg.sender, block.timestamp);
    }

    /**
     * @notice Verify that a given hash matches a stored attestation.
     */
    function verify(uint256 id, bytes32 eventHash) external view returns (bool) {
        return attestations[id].eventHash == eventHash;
    }

    /**
     * @notice Get full attestation details.
     */
    function getAttestation(uint256 id) external view returns (Attestation memory) {
        require(id < attestationCount, "Not found");
        return attestations[id];
    }
}
