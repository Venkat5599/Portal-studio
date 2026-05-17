// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title MantleGuardPolicyRegistry
/// @notice Stores protocol-level AI firewall policies for MantleGuard integrations.
contract MantleGuardPolicyRegistry {
    enum EnforcementMode {
        Monitor,
        Warn,
        Block
    }

    struct Policy {
        address owner;
        bytes32 policyHash;
        EnforcementMode mode;
        uint8 blockThreshold;
        uint8 warnThreshold;
        string metadataURI;
        uint256 updatedAt;
    }

    mapping(bytes32 policyId => Policy) public policies;

    event PolicyUpdated(
        bytes32 indexed policyId,
        address indexed owner,
        bytes32 indexed policyHash,
        EnforcementMode mode,
        uint8 warnThreshold,
        uint8 blockThreshold,
        string metadataURI
    );

    error InvalidThresholds();
    error NotPolicyOwner();
    error EmptyPolicyHash();

    function upsertPolicy(
        bytes32 policyId,
        bytes32 policyHash,
        EnforcementMode mode,
        uint8 warnThreshold,
        uint8 blockThreshold,
        string calldata metadataURI
    ) external {
        if (policyHash == bytes32(0)) revert EmptyPolicyHash();
        if (warnThreshold > blockThreshold || blockThreshold > 100) {
            revert InvalidThresholds();
        }

        Policy storage policy = policies[policyId];

        if (policy.owner != address(0) && policy.owner != msg.sender) {
            revert NotPolicyOwner();
        }

        policy.owner = msg.sender;
        policy.policyHash = policyHash;
        policy.mode = mode;
        policy.warnThreshold = warnThreshold;
        policy.blockThreshold = blockThreshold;
        policy.metadataURI = metadataURI;
        policy.updatedAt = block.timestamp;

        emit PolicyUpdated(
            policyId,
            msg.sender,
            policyHash,
            mode,
            warnThreshold,
            blockThreshold,
            metadataURI
        );
    }
}
