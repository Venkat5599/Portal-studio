// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title MantleGuardAttestor
/// @notice Stores AI security analysis attestations for MantleGuard reports.
contract MantleGuardAttestor {
    struct Attestation {
        address reporter;
        bytes32 subjectHash;
        bytes32 sourceHash;
        bytes32 reportHash;
        uint8 riskScore;
        string verdict;
        string model;
        string reportURI;
        uint256 blockNumber;
        uint256 timestamp;
    }

    uint256 public attestationCount;

    mapping(uint256 id => Attestation) public attestations;
    mapping(bytes32 reportHash => bool recorded) public reportRecorded;

    event AnalysisAttested(
        uint256 indexed id,
        address indexed reporter,
        bytes32 indexed subjectHash,
        bytes32 sourceHash,
        bytes32 reportHash,
        uint8 riskScore,
        string verdict,
        string model,
        string reportURI
    );

    event FirewallVerdictAttested(
        uint256 indexed id,
        address indexed reporter,
        bytes32 indexed subjectHash,
        bytes32 intentHash,
        bytes32 verdictHash,
        uint8 riskScore,
        string verdict,
        string model,
        string reportURI
    );

    error InvalidRiskScore();
    error EmptyReportHash();
    error DuplicateReport();

    function attestAnalysis(
        bytes32 subjectHash,
        bytes32 sourceHash,
        bytes32 reportHash,
        uint8 riskScore,
        string calldata verdict,
        string calldata model,
        string calldata reportURI
    ) external returns (uint256 id) {
        if (riskScore > 100) revert InvalidRiskScore();
        if (reportHash == bytes32(0)) revert EmptyReportHash();
        if (reportRecorded[reportHash]) revert DuplicateReport();

        id = ++attestationCount;
        reportRecorded[reportHash] = true;

        attestations[id] = Attestation({
            reporter: msg.sender,
            subjectHash: subjectHash,
            sourceHash: sourceHash,
            reportHash: reportHash,
            riskScore: riskScore,
            verdict: verdict,
            model: model,
            reportURI: reportURI,
            blockNumber: block.number,
            timestamp: block.timestamp
        });

        emit AnalysisAttested(
            id,
            msg.sender,
            subjectHash,
            sourceHash,
            reportHash,
            riskScore,
            verdict,
            model,
            reportURI
        );
    }

    function attestFirewallVerdict(
        bytes32 subjectHash,
        bytes32 intentHash,
        bytes32 verdictHash,
        uint8 riskScore,
        string calldata verdict,
        string calldata model,
        string calldata reportURI
    ) external returns (uint256 id) {
        if (riskScore > 100) revert InvalidRiskScore();
        if (verdictHash == bytes32(0)) revert EmptyReportHash();
        if (reportRecorded[verdictHash]) revert DuplicateReport();

        id = ++attestationCount;
        reportRecorded[verdictHash] = true;

        attestations[id] = Attestation({
            reporter: msg.sender,
            subjectHash: subjectHash,
            sourceHash: intentHash,
            reportHash: verdictHash,
            riskScore: riskScore,
            verdict: verdict,
            model: model,
            reportURI: reportURI,
            blockNumber: block.number,
            timestamp: block.timestamp
        });

        emit FirewallVerdictAttested(
            id,
            msg.sender,
            subjectHash,
            intentHash,
            verdictHash,
            riskScore,
            verdict,
            model,
            reportURI
        );
    }
}
