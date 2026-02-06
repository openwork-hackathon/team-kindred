// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./KindredComment.sol";

/**
 * @title KindredReputationOracle
 * @notice Calculates user reputation from KindredComment activity
 * @dev Implements IReputationOracle interface for KindredHook integration
 * 
 * Reputation Formula:
 * - Base: 500 (default for users with no activity)
 * - +10 per comment created
 * - +1 per upvote value / 1e18 (normalized)
 * - -1 per downvote value / 1e18 (normalized)
 * - +5 per premium unlock received
 * - Max score: 1000
 * - Min score: 0
 * 
 * @author Steve Jobs 🍎 | Team Kindred
 */
contract KindredReputationOracle {
    // ============ Errors ============
    error ZeroAddress();
    
    // ============ State ============
    KindredComment public immutable kindredComment;
    
    // Manual overrides (for emergency blocking)
    mapping(address => bool) public blocked;
    address public owner;
    
    // ============ Events ============
    event AccountBlocked(address indexed account, bool isBlocked);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    // ============ Constants ============
    uint256 public constant BASE_SCORE = 500;
    uint256 public constant MAX_SCORE = 1000;
    uint256 public constant POINTS_PER_COMMENT = 10;
    uint256 public constant POINTS_PER_UNLOCK = 5;
    uint256 public constant NORMALIZATION_FACTOR = 1e18;
    
    /// @notice Maximum comments to scan to prevent DoS (C-1 mitigation)
    uint256 public constant MAX_COMMENTS_SCAN = 100;
    
    // ============ Modifiers ============
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    // ============ Constructor ============
    constructor(address _kindredComment) {
        if (_kindredComment == address(0)) revert ZeroAddress();
        kindredComment = KindredComment(_kindredComment);
        owner = msg.sender;
    }
    
    // ============ Core Functions ============
    
    /**
     * @notice Calculate reputation score for an account
     * @param account The address to check
     * @return score The calculated reputation (0-1000)
     * 
     * @dev C-1 FIX: Only scans up to MAX_COMMENTS_SCAN (100) most recent comments
     * to prevent DoS attacks. Users with >100 comments will have incomplete scores.
     * Post-hackathon: Implement incremental score storage.
     */
    function getScore(address account) external view returns (uint256 score) {
        // Blocked accounts always return 0
        if (blocked[account]) return 0;
        
        // Start with base score
        score = BASE_SCORE;
        
        // Get user's comments
        uint256[] memory commentIds = kindredComment.getUserComments(account);
        
        if (commentIds.length == 0) {
            return BASE_SCORE; // No activity = default score
        }
        
        // C-1 MITIGATION: Limit scan to prevent DoS
        // Only scan most recent MAX_COMMENTS_SCAN comments
        uint256 scanLimit = commentIds.length > MAX_COMMENTS_SCAN 
            ? MAX_COMMENTS_SCAN 
            : commentIds.length;
        
        // Calculate total reputation from scanned comments
        int256 totalPoints = 0;
        
        for (uint256 i = 0; i < scanLimit; i++) {
            KindredComment.Comment memory comment = kindredComment.getComment(commentIds[i]);
            
            // Points for creating comment
            totalPoints += int256(POINTS_PER_COMMENT);
            
            // Points for upvotes received
            totalPoints += int256(comment.upvoteValue / NORMALIZATION_FACTOR);
            
            // Penalty for downvotes received
            totalPoints -= int256(comment.downvoteValue / NORMALIZATION_FACTOR);
            
            // Bonus for premium unlocks
            totalPoints += int256(comment.totalUnlocks * POINTS_PER_UNLOCK);
        }
        
        // Apply total points to base score
        if (totalPoints >= 0) {
            score = BASE_SCORE + uint256(totalPoints);
            if (score > MAX_SCORE) score = MAX_SCORE;
        } else {
            uint256 penalty = uint256(-totalPoints);
            if (penalty >= BASE_SCORE) {
                score = 0;
            } else {
                score = BASE_SCORE - penalty;
            }
        }
        
        return score;
    }
    
    /**
     * @notice Check if account is blocked
     * @param account The address to check
     * @return True if blocked
     */
    function isBlocked(address account) external view returns (bool) {
        return blocked[account];
    }
    
    /**
     * @notice Check if user has exceeded comment scan limit
     * @param account The address to check
     * @return exceeded True if user has more than MAX_COMMENTS_SCAN comments
     * @return totalComments Total number of comments
     * @return scannedComments Number of comments that will be scanned
     * 
     * @dev Use this to warn users their score may be incomplete
     */
    function hasExceededScanLimit(address account) external view returns (
        bool exceeded,
        uint256 totalComments,
        uint256 scannedComments
    ) {
        uint256[] memory commentIds = kindredComment.getUserComments(account);
        totalComments = commentIds.length;
        scannedComments = totalComments > MAX_COMMENTS_SCAN ? MAX_COMMENTS_SCAN : totalComments;
        exceeded = totalComments > MAX_COMMENTS_SCAN;
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Manually block/unblock an account
     * @param account The address to block
     * @param _blocked True to block, false to unblock
     */
    function setBlocked(address account, bool _blocked) external onlyOwner {
        if (account == address(0)) revert ZeroAddress();
        blocked[account] = _blocked;
        emit AccountBlocked(account, _blocked);
    }
    
    /**
     * @notice Transfer ownership
     * @param newOwner The new owner address
     */
    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Preview score calculation details for debugging
     * @param account The address to analyze
     * @return baseScore The starting score
     * @return commentCount Number of comments (total, not scanned)
     * @return totalUpvotes Total upvote value received (from scanned comments)
     * @return totalDownvotes Total downvote value received (from scanned comments)
     * @return totalUnlocks Total premium unlocks (from scanned comments)
     * @return finalScore The final calculated score
     * 
     * @dev C-1 FIX: Only scans up to MAX_COMMENTS_SCAN comments
     */
    function getScoreBreakdown(address account) external view returns (
        uint256 baseScore,
        uint256 commentCount,
        uint256 totalUpvotes,
        uint256 totalDownvotes,
        uint256 totalUnlocks,
        uint256 finalScore
    ) {
        if (blocked[account]) {
            return (0, 0, 0, 0, 0, 0);
        }
        
        baseScore = BASE_SCORE;
        uint256[] memory commentIds = kindredComment.getUserComments(account);
        commentCount = commentIds.length;
        
        // C-1 MITIGATION: Limit scan to prevent DoS
        uint256 scanLimit = commentIds.length > MAX_COMMENTS_SCAN 
            ? MAX_COMMENTS_SCAN 
            : commentIds.length;
        
        for (uint256 i = 0; i < scanLimit; i++) {
            KindredComment.Comment memory comment = kindredComment.getComment(commentIds[i]);
            totalUpvotes += comment.upvoteValue;
            totalDownvotes += comment.downvoteValue;
            totalUnlocks += comment.totalUnlocks;
        }
        
        // Calculate final score (same logic as getScore)
        // Note: Uses scanned count, not total count
        int256 totalPoints = 0;
        totalPoints += int256(scanLimit * POINTS_PER_COMMENT);
        totalPoints += int256(totalUpvotes / NORMALIZATION_FACTOR);
        totalPoints -= int256(totalDownvotes / NORMALIZATION_FACTOR);
        totalPoints += int256(totalUnlocks * POINTS_PER_UNLOCK);
        
        if (totalPoints >= 0) {
            finalScore = BASE_SCORE + uint256(totalPoints);
            if (finalScore > MAX_SCORE) finalScore = MAX_SCORE;
        } else {
            uint256 penalty = uint256(-totalPoints);
            if (penalty >= BASE_SCORE) {
                finalScore = 0;
            } else {
                finalScore = BASE_SCORE - penalty;
            }
        }
    }
}
