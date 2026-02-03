// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IReputationOracle} from "./interfaces/IReputationOracle.sol";

/**
 * @title ReputationOracle
 * @notice On-chain reputation oracle for Kindred ecosystem
 * @dev Stores reputation scores for users, projects, agents, and tokens
 * 
 * Security considerations:
 * - Only authorized updaters can modify scores
 * - Score range enforced (0-10000 bps)
 * - Stale data protection via timestamps
 */
contract ReputationOracle is IReputationOracle {
    // ============ Constants ============
    
    uint256 public constant MAX_SCORE = 10000; // 100.00%
    uint256 public constant DEFAULT_SCORE = 5000; // 50.00% (neutral)
    
    // ============ Errors ============
    
    error Unauthorized();
    error ScoreOutOfRange();
    error InvalidEntity();
    
    // ============ Events ============
    
    event ReputationUpdated(address indexed entity, uint256 oldScore, uint256 newScore);
    event UpdaterAdded(address indexed updater);
    event UpdaterRemoved(address indexed updater);
    event CategoryCreated(bytes32 indexed category, string name);
    
    // ============ Structs ============
    
    struct ReputationData {
        uint256 score;
        uint256 lastUpdated;
        EntityType entityType;
    }
    
    struct CategoryRanking {
        address[] entities;
        mapping(address => uint256) rankings; // 1-indexed, 0 = not ranked
    }
    
    // ============ State ============
    
    address public admin;
    mapping(address => bool) public authorizedUpdaters;
    mapping(address => ReputationData) public reputations;
    mapping(bytes32 => CategoryRanking) internal categoryRankings;
    mapping(bytes32 => string) public categoryNames;
    
    // ============ Modifiers ============
    
    modifier onlyAdmin() {
        if (msg.sender != admin) revert Unauthorized();
        _;
    }
    
    modifier onlyAuthorized() {
        if (!authorizedUpdaters[msg.sender] && msg.sender != admin) revert Unauthorized();
        _;
    }
    
    // ============ Constructor ============
    
    constructor() {
        admin = msg.sender;
        authorizedUpdaters[msg.sender] = true;
    }
    
    // ============ Core Functions ============
    
    /// @inheritdoc IReputationOracle
    function getReputation(address entity) external view returns (uint256) {
        ReputationData storage data = reputations[entity];
        if (data.lastUpdated == 0) {
            return DEFAULT_SCORE; // Return default for unknown entities
        }
        return data.score;
    }
    
    /// @inheritdoc IReputationOracle
    function meetsMinimum(address entity, uint256 minScore) external view returns (bool) {
        ReputationData storage data = reputations[entity];
        uint256 score = data.lastUpdated == 0 ? DEFAULT_SCORE : data.score;
        return score >= minScore;
    }
    
    /// @inheritdoc IReputationOracle
    function getRanking(address entity, bytes32 category) external view returns (uint256) {
        return categoryRankings[category].rankings[entity];
    }
    
    /// @inheritdoc IReputationOracle
    function updateReputation(address entity, uint256 score) external onlyAuthorized {
        if (entity == address(0)) revert InvalidEntity();
        if (score > MAX_SCORE) revert ScoreOutOfRange();
        
        uint256 oldScore = reputations[entity].score;
        reputations[entity].score = score;
        reputations[entity].lastUpdated = block.timestamp;
        
        emit ReputationUpdated(entity, oldScore, score);
    }
    
    // ============ Batch Functions ============
    
    /// @notice Batch update reputations
    function batchUpdateReputation(
        address[] calldata entities,
        uint256[] calldata scores
    ) external onlyAuthorized {
        require(entities.length == scores.length, "Length mismatch");
        
        for (uint256 i = 0; i < entities.length; i++) {
            if (entities[i] == address(0)) revert InvalidEntity();
            if (scores[i] > MAX_SCORE) revert ScoreOutOfRange();
            
            uint256 oldScore = reputations[entities[i]].score;
            reputations[entities[i]].score = scores[i];
            reputations[entities[i]].lastUpdated = block.timestamp;
            
            emit ReputationUpdated(entities[i], oldScore, scores[i]);
        }
    }
    
    /// @notice Get batch reputations
    function getBatchReputation(address[] calldata entities) external view returns (uint256[] memory) {
        uint256[] memory scores = new uint256[](entities.length);
        for (uint256 i = 0; i < entities.length; i++) {
            ReputationData storage data = reputations[entities[i]];
            scores[i] = data.lastUpdated == 0 ? DEFAULT_SCORE : data.score;
        }
        return scores;
    }
    
    // ============ Ranking Functions ============
    
    /// @notice Create a new category
    function createCategory(bytes32 category, string calldata name) external onlyAdmin {
        categoryNames[category] = name;
        emit CategoryCreated(category, name);
    }
    
    /// @notice Update rankings for a category
    function updateCategoryRankings(
        bytes32 category,
        address[] calldata rankedEntities
    ) external onlyAuthorized {
        CategoryRanking storage ranking = categoryRankings[category];
        
        // Clear old rankings
        for (uint256 i = 0; i < ranking.entities.length; i++) {
            ranking.rankings[ranking.entities[i]] = 0;
        }
        
        // Set new rankings
        ranking.entities = rankedEntities;
        for (uint256 i = 0; i < rankedEntities.length; i++) {
            ranking.rankings[rankedEntities[i]] = i + 1; // 1-indexed
        }
    }
    
    /// @notice Get top N entities in category
    function getTopEntities(bytes32 category, uint256 n) external view returns (address[] memory) {
        CategoryRanking storage ranking = categoryRankings[category];
        uint256 count = n > ranking.entities.length ? ranking.entities.length : n;
        
        address[] memory top = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            top[i] = ranking.entities[i];
        }
        return top;
    }
    
    // ============ Admin Functions ============
    
    /// @notice Add authorized updater
    function addUpdater(address updater) external onlyAdmin {
        authorizedUpdaters[updater] = true;
        emit UpdaterAdded(updater);
    }
    
    /// @notice Remove authorized updater
    function removeUpdater(address updater) external onlyAdmin {
        authorizedUpdaters[updater] = false;
        emit UpdaterRemoved(updater);
    }
    
    /// @notice Transfer admin
    function transferAdmin(address newAdmin) external onlyAdmin {
        admin = newAdmin;
    }
    
    // ============ View Functions ============
    
    /// @notice Get full reputation data
    function getReputationData(address entity) external view returns (
        uint256 score,
        uint256 lastUpdated,
        EntityType entityType
    ) {
        ReputationData storage data = reputations[entity];
        return (
            data.lastUpdated == 0 ? DEFAULT_SCORE : data.score,
            data.lastUpdated,
            data.entityType
        );
    }
    
    /// @notice Check if data is fresh
    function isDataFresh(address entity, uint256 maxAge) external view returns (bool) {
        if (reputations[entity].lastUpdated == 0) return false;
        return block.timestamp - reputations[entity].lastUpdated <= maxAge;
    }
}
