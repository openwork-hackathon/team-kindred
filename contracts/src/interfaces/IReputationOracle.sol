// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/**
 * @title IReputationOracle
 * @notice Interface for Kindred reputation queries
 * @dev Used by KindredHook for reputation-weighted operations
 */
interface IReputationOracle {
    /// @notice Entity types
    enum EntityType { User, Project, Agent, Token }

    /// @notice Get reputation score (0-10000 basis points)
    function getReputation(address entity) external view returns (uint256);

    /// @notice Check if entity meets minimum reputation
    function meetsMinimum(address entity, uint256 minScore) external view returns (bool);

    /// @notice Get ranking in category
    function getRanking(address entity, bytes32 category) external view returns (uint256 rank);

    /// @notice Update reputation (authorized only)
    function updateReputation(address entity, uint256 score) external;
}
