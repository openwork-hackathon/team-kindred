// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ReputationOracle
 * @notice On-chain reputation scoring for the Kindred protocol
 * @dev Stores and manages reputation scores for users and projects
 * @author Patrick Collins 🛡️ | Team Kindred
 */
contract ReputationOracle is Ownable {
    // ============ State ============
    
    /// @notice Reputation scores by address (0-1000 scale)
    mapping(address => uint256) public scores;
    
    /// @notice Blocked addresses
    mapping(address => bool) public blocked;
    
    /// @notice Authorized updaters (oracles, keepers)
    mapping(address => bool) public updaters;
    
    /// @notice Maximum possible score
    uint256 public constant MAX_SCORE = 1000;
    
    /// @notice Default score for new users
    uint256 public constant DEFAULT_SCORE = 500;
    
    // ============ Events ============
    
    event ScoreUpdated(address indexed account, uint256 oldScore, uint256 newScore, address indexed updater);
    event AccountBlocked(address indexed account, bool blocked);
    event UpdaterSet(address indexed updater, bool authorized);
    
    // ============ Errors ============
    
    error NotAuthorized();
    error ScoreTooHigh(uint256 score);
    error ZeroAddress();
    
    // ============ Modifiers ============
    
    modifier onlyUpdater() {
        if (!updaters[msg.sender] && msg.sender != owner()) {
            revert NotAuthorized();
        }
        _;
    }
    
    // ============ Constructor ============
    
    constructor() Ownable(msg.sender) {
        // Owner is automatically an updater
        updaters[msg.sender] = true;
    }
    
    // ============ External Functions ============
    
    /// @notice Get the reputation score for an account
    /// @param account The address to query
    /// @return The reputation score (0-1000)
    function getScore(address account) external view returns (uint256) {
        uint256 score = scores[account];
        // Return default score if never set
        if (score == 0 && !blocked[account]) {
            return DEFAULT_SCORE;
        }
        return score;
    }
    
    /// @notice Check if an account is blocked
    /// @param account The address to check
    /// @return True if blocked
    function isBlocked(address account) external view returns (bool) {
        return blocked[account];
    }
    
    /// @notice Set reputation score for an account
    /// @param account The address to update
    /// @param score The new score (0-1000)
    function setScore(address account, uint256 score) external onlyUpdater {
        if (account == address(0)) revert ZeroAddress();
        if (score > MAX_SCORE) revert ScoreTooHigh(score);
        
        uint256 oldScore = scores[account];
        scores[account] = score;
        
        emit ScoreUpdated(account, oldScore, score, msg.sender);
    }
    
    /// @notice Batch set reputation scores
    /// @param accounts Array of addresses
    /// @param _scores Array of scores
    function batchSetScores(
        address[] calldata accounts,
        uint256[] calldata _scores
    ) external onlyUpdater {
        require(accounts.length == _scores.length, "Length mismatch");
        
        for (uint256 i = 0; i < accounts.length; i++) {
            if (accounts[i] == address(0)) revert ZeroAddress();
            if (_scores[i] > MAX_SCORE) revert ScoreTooHigh(_scores[i]);
            
            uint256 oldScore = scores[accounts[i]];
            scores[accounts[i]] = _scores[i];
            
            emit ScoreUpdated(accounts[i], oldScore, _scores[i], msg.sender);
        }
    }
    
    /// @notice Block or unblock an account
    /// @param account The address to update
    /// @param _blocked Whether to block
    function setBlocked(address account, bool _blocked) external onlyUpdater {
        if (account == address(0)) revert ZeroAddress();
        
        blocked[account] = _blocked;
        emit AccountBlocked(account, _blocked);
    }
    
    /// @notice Add or remove an updater
    /// @param updater The address to authorize
    /// @param authorized Whether to authorize
    function setUpdater(address updater, bool authorized) external onlyOwner {
        if (updater == address(0)) revert ZeroAddress();
        
        updaters[updater] = authorized;
        emit UpdaterSet(updater, authorized);
    }
    
    /// @notice Increase score by a delta (with cap at MAX_SCORE)
    /// @param account The address to update
    /// @param delta The amount to increase
    function increaseScore(address account, uint256 delta) external onlyUpdater {
        if (account == address(0)) revert ZeroAddress();
        
        uint256 oldScore = scores[account];
        if (oldScore == 0) oldScore = DEFAULT_SCORE;
        
        uint256 newScore = oldScore + delta;
        if (newScore > MAX_SCORE) newScore = MAX_SCORE;
        
        scores[account] = newScore;
        emit ScoreUpdated(account, oldScore, newScore, msg.sender);
    }
    
    /// @notice Decrease score by a delta (with floor at 0)
    /// @param account The address to update
    /// @param delta The amount to decrease
    function decreaseScore(address account, uint256 delta) external onlyUpdater {
        if (account == address(0)) revert ZeroAddress();
        
        uint256 oldScore = scores[account];
        if (oldScore == 0) oldScore = DEFAULT_SCORE;
        
        uint256 newScore = oldScore > delta ? oldScore - delta : 0;
        
        scores[account] = newScore;
        emit ScoreUpdated(account, oldScore, newScore, msg.sender);
    }
}
