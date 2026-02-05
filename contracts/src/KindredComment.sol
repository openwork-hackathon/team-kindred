// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title KindredComment
 * @notice Pay-to-comment NFT system with staking and rewards
 * @dev Comments are ERC-721 NFTs, uses external ERC-20 for staking
 * 
 * Core Mechanics:
 * 1. Pay-to-Comment: Users stake KIND tokens to post comments
 * 2. Comment = NFT: Each comment mints as unique NFT
 * 3. Upvote = Investment: Stake tokens to support comments
 * 4. x402 Unlock: Readers pay to access premium content
 * 
 * Reward Distribution:
 * - 70% to comment author
 * - 20% to early upvoters (weighted by stake)
 * - 10% protocol fee
 * 
 * @author Patrick Collins 🛡️ | Team Kindred
 */
contract KindredComment is ERC721, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // ============ Errors ============
    error InsufficientStake();
    error CommentNotFound();
    error AlreadyUnlocked();
    error NotCommentOwner();
    error InvalidContent();
    error TransferFailed();
    
    // ============ Events ============
    event CommentCreated(
        uint256 indexed tokenId,
        address indexed author,
        bytes32 indexed projectId,
        uint256 stakeAmount,
        string contentHash
    );
    
    event CommentUpvoted(
        uint256 indexed tokenId,
        address indexed voter,
        uint256 amount
    );
    
    event CommentDownvoted(
        uint256 indexed tokenId,
        address indexed voter,
        uint256 amount
    );
    
    event PremiumUnlocked(
        uint256 indexed tokenId,
        address indexed reader,
        uint256 paidAmount
    );
    
    event RewardsDistributed(
        uint256 indexed tokenId,
        uint256 authorReward,
        uint256 voterReward,
        uint256 protocolFee
    );
    
    // ============ Structs ============
    
    struct Comment {
        address author;
        bytes32 projectId;        // Which project this reviews
        string contentHash;       // IPFS hash of comment content
        string premiumHash;       // IPFS hash of premium content (x402)
        uint256 stakeAmount;      // Amount staked to post
        uint256 upvoteValue;      // Total value of upvotes
        uint256 downvoteValue;    // Total value of downvotes
        uint256 unlockPrice;      // Price to unlock premium content
        uint256 totalUnlocks;     // Number of premium unlocks
        uint256 createdAt;
        bool isPremium;           // Has premium content?
    }
    
    struct Vote {
        bool isUpvote;
        uint256 amount;
        uint256 timestamp;
    }
    
    // ============ Constants ============
    
    uint256 public constant MIN_STAKE = 100 * 1e18;        // 100 tokens minimum
    uint256 public constant AUTHOR_SHARE = 7000;           // 70% to author
    uint256 public constant VOTER_SHARE = 2000;            // 20% to early voters
    uint256 public constant PROTOCOL_SHARE = 1000;         // 10% protocol fee
    uint256 public constant BASIS_POINTS = 10000;
    
    // ============ State ============
    
    IERC20 public immutable kindToken;
    uint256 private _nextTokenId;
    
    mapping(uint256 => Comment) public comments;
    mapping(uint256 => mapping(address => Vote)) public votes;
    mapping(uint256 => address[]) public voters;
    mapping(uint256 => mapping(address => bool)) public hasUnlocked;
    
    // Stats
    mapping(bytes32 => uint256[]) public projectComments;  // projectId => tokenIds
    mapping(address => uint256[]) public userComments;     // author => tokenIds
    
    address public treasury;
    uint256 public totalComments;
    uint256 public totalStaked;
    
    // ============ Constructor ============
    
    constructor(address _kindToken, address _treasury) 
        ERC721("Kindred Comment", "kCOMMENT")
        Ownable(msg.sender)
    {
        kindToken = IERC20(_kindToken);
        treasury = _treasury;
    }
    
    // ============ Core Functions ============
    
    /**
     * @notice Create a new comment NFT
     * @param projectId The project being reviewed
     * @param contentHash IPFS hash of comment content
     * @param premiumHash IPFS hash of premium content (empty if none)
     * @param unlockPrice Price to unlock premium content (0 if no premium)
     * @param extraStake Additional stake beyond minimum
     */
    function createComment(
        bytes32 projectId,
        string calldata contentHash,
        string calldata premiumHash,
        uint256 unlockPrice,
        uint256 extraStake
    ) external nonReentrant returns (uint256) {
        // ============ CHECKS ============
        if (bytes(contentHash).length == 0) revert InvalidContent();
        
        uint256 stakeAmount = MIN_STAKE + extraStake;
        uint256 tokenId = _nextTokenId;
        
        // ============ EFFECTS ============
        _nextTokenId++;
        
        comments[tokenId] = Comment({
            author: msg.sender,
            projectId: projectId,
            contentHash: contentHash,
            premiumHash: premiumHash,
            stakeAmount: stakeAmount,
            upvoteValue: 0,
            downvoteValue: 0,
            unlockPrice: unlockPrice,
            totalUnlocks: 0,
            createdAt: block.timestamp,
            isPremium: bytes(premiumHash).length > 0
        });
        
        // Track comment
        projectComments[projectId].push(tokenId);
        userComments[msg.sender].push(tokenId);
        totalComments++;
        totalStaked += stakeAmount;
        
        // ============ INTERACTIONS ============
        // Transfer stake from user (after state changes)
        kindToken.safeTransferFrom(msg.sender, address(this), stakeAmount);
        
        // Mint NFT to author
        _safeMint(msg.sender, tokenId);
        
        emit CommentCreated(tokenId, msg.sender, projectId, stakeAmount, contentHash);
        
        return tokenId;
    }
    
    /**
     * @notice Upvote a comment (stake tokens as vote)
     * @param tokenId The comment to upvote
     * @param amount Amount to stake on this vote
     */
    function upvote(uint256 tokenId, uint256 amount) external nonReentrant {
        _vote(tokenId, amount, true);
    }
    
    /**
     * @notice Downvote a comment
     * @param tokenId The comment to downvote
     * @param amount Amount to stake on this vote
     */
    function downvote(uint256 tokenId, uint256 amount) external nonReentrant {
        _vote(tokenId, amount, false);
    }
    
    function _vote(uint256 tokenId, uint256 amount, bool isUpvote) internal {
        // ============ CHECKS ============
        Comment storage comment = comments[tokenId];
        if (comment.author == address(0)) revert CommentNotFound();
        
        Vote storage existingVote = votes[tokenId][msg.sender];
        bool isNewVoter = existingVote.amount == 0;
        uint256 oldAmount = existingVote.amount;
        bool wasUpvote = existingVote.isUpvote;
        uint256 newAmount = oldAmount + amount;
        
        // ============ EFFECTS ============
        // Track new voter BEFORE external call
        if (isNewVoter) {
            voters[tokenId].push(msg.sender);
        }
        
        // Adjust totals if changing vote direction
        if (oldAmount > 0) {
            if (wasUpvote) {
                comment.upvoteValue -= oldAmount;
            } else {
                comment.downvoteValue -= oldAmount;
            }
        }
        
        // Update vote record
        votes[tokenId][msg.sender] = Vote({
            isUpvote: isUpvote,
            amount: newAmount,
            timestamp: block.timestamp
        });
        
        // Update comment totals
        if (isUpvote) {
            comment.upvoteValue += newAmount;
        } else {
            comment.downvoteValue += newAmount;
        }
        
        totalStaked += amount;
        
        // ============ INTERACTIONS ============
        // Transfer voting stake (last, after all state changes)
        kindToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // Emit event
        if (isUpvote) {
            emit CommentUpvoted(tokenId, msg.sender, amount);
        } else {
            emit CommentDownvoted(tokenId, msg.sender, amount);
        }
    }
    
    /**
     * @notice Unlock premium content (x402 payment)
     * @param tokenId The comment to unlock
     */
    function unlockPremium(uint256 tokenId) external nonReentrant {
        // ============ CHECKS ============
        Comment storage comment = comments[tokenId];
        if (comment.author == address(0)) revert CommentNotFound();
        if (!comment.isPremium) revert InvalidContent();
        if (hasUnlocked[tokenId][msg.sender]) revert AlreadyUnlocked();
        
        uint256 price = comment.unlockPrice;
        
        // ============ EFFECTS ============
        // Mark as unlocked BEFORE external calls
        hasUnlocked[tokenId][msg.sender] = true;
        comment.totalUnlocks++;
        
        // ============ INTERACTIONS ============
        // Transfer payment
        kindToken.safeTransferFrom(msg.sender, address(this), price);
        
        // Distribute rewards (contains more external calls)
        _distributeRewards(tokenId, price);
        
        emit PremiumUnlocked(tokenId, msg.sender, price);
    }
    
    // ============ Internal Functions ============
    
    function _distributeRewards(uint256 tokenId, uint256 amount) internal {
        Comment storage comment = comments[tokenId];
        
        uint256 authorReward = (amount * AUTHOR_SHARE) / BASIS_POINTS;
        uint256 voterReward = (amount * VOTER_SHARE) / BASIS_POINTS;
        uint256 protocolFee = amount - authorReward - voterReward;
        
        // Pay author (SafeERC20)
        kindToken.safeTransfer(comment.author, authorReward);
        
        // Pay early upvoters (weighted by stake)
        _distributeToVoters(tokenId, voterReward);
        
        // Protocol fee (SafeERC20)
        kindToken.safeTransfer(treasury, protocolFee);
        
        emit RewardsDistributed(tokenId, authorReward, voterReward, protocolFee);
    }
    
    function _distributeToVoters(uint256 tokenId, uint256 totalReward) internal {
        address[] memory voterList = voters[tokenId];
        if (voterList.length == 0) {
            kindToken.safeTransfer(treasury, totalReward);
            return;
        }
        
        Comment storage comment = comments[tokenId];
        uint256 totalUpvotes = comment.upvoteValue;
        
        if (totalUpvotes == 0) {
            kindToken.safeTransfer(treasury, totalReward);
            return;
        }
        
        // Distribute proportionally to upvoters
        uint256 distributed = 0;
        for (uint256 i = 0; i < voterList.length; i++) {
            Vote storage vote = votes[tokenId][voterList[i]];
            if (vote.isUpvote && vote.amount > 0) {
                uint256 share = (totalReward * vote.amount) / totalUpvotes;
                if (share > 0) {
                    kindToken.safeTransfer(voterList[i], share);
                    distributed += share;
                }
            }
        }
        
        // Send remainder to treasury (dust)
        if (distributed < totalReward) {
            kindToken.safeTransfer(treasury, totalReward - distributed);
        }
    }
    
    // ============ View Functions ============
    
    function getComment(uint256 tokenId) external view returns (Comment memory) {
        return comments[tokenId];
    }
    
    function getVote(uint256 tokenId, address voter) external view returns (Vote memory) {
        return votes[tokenId][voter];
    }
    
    function getNetScore(uint256 tokenId) external view returns (int256) {
        Comment storage comment = comments[tokenId];
        return int256(comment.upvoteValue) - int256(comment.downvoteValue);
    }
    
    function canAccessPremium(uint256 tokenId, address user) external view returns (bool) {
        Comment storage comment = comments[tokenId];
        return comment.author == user || 
               ownerOf(tokenId) == user || 
               hasUnlocked[tokenId][user];
    }
    
    function getProjectComments(bytes32 projectId) external view returns (uint256[] memory) {
        return projectComments[projectId];
    }
    
    function getUserComments(address user) external view returns (uint256[] memory) {
        return userComments[user];
    }
    
    function getVoterCount(uint256 tokenId) external view returns (uint256) {
        return voters[tokenId].length;
    }
    
    // ============ Admin Functions ============
    
    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
    }
    
    /**
     * @notice Emergency withdraw stuck tokens
     * @param token The token to withdraw
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(treasury, amount);
    }
}
