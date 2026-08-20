// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title A single-ballot vote over constructor-defined topics
contract Voting {
    struct Topic { string name; uint256 votes; }

    Topic[] private topics;
    mapping(address => bool) public isDenied;
    mapping(address => bool) public hasVoted;

    error NoTopics();
    error EmptyTopic(uint256 index);
    error DeniedVoter();
    error AlreadyVoted();
    error InvalidTopic();

    event VoteCast(address indexed voter, uint256 indexed topicIndex);

    constructor(string[] memory topicNames, address[] memory deniedAccounts) {
        if (topicNames.length == 0) revert NoTopics();
        for (uint256 i = 0; i < topicNames.length; i++) {
            if (bytes(topicNames[i]).length == 0) revert EmptyTopic(i);
            topics.push(Topic({name: topicNames[i], votes: 0}));
        }
        for (uint256 i = 0; i < deniedAccounts.length; i++) {
            isDenied[deniedAccounts[i]] = true;
        }
    }

    function vote(uint256 topicIndex) external {
        if (isDenied[msg.sender]) revert DeniedVoter();
        if (hasVoted[msg.sender]) revert AlreadyVoted();
        if (topicIndex >= topics.length) revert InvalidTopic();
        hasVoted[msg.sender] = true;
        topics[topicIndex].votes += 1;
        emit VoteCast(msg.sender, topicIndex);
    }

    function canVote(address account) external view returns (bool) {
        return !isDenied[account] && !hasVoted[account];
    }

    function topicCount() external view returns (uint256) { return topics.length; }

    function topicName(uint256 topicIndex) external view returns (string memory) {
        if (topicIndex >= topics.length) revert InvalidTopic();
        return topics[topicIndex].name;
    }

    function voteCount(uint256 topicIndex) external view returns (uint256) {
        if (topicIndex >= topics.length) revert InvalidTopic();
        return topics[topicIndex].votes;
    }
}
