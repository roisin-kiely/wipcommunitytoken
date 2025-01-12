// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @custom:security-contact rik@superhi.com
contract WIP is ERC20, Ownable {
    uint256 public postThreshold;
    uint256 public commentThreshold;

    constructor() ERC20("WIP", "WIP") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10 ** decimals());
        postThreshold = 100 * 10 ** decimals();
        commentThreshold = 25 * 10 ** decimals();
    }

    // Owner can update thresholds
    function setPostThreshold(uint256 newThreshold) public onlyOwner {
        postThreshold = newThreshold * 10 ** decimals();
    }

    function setCommentThreshold(uint256 newThreshold) public onlyOwner {
        commentThreshold = newThreshold * 10 ** decimals();
    }

    // Check permissions for posting and commenting
    function canPost(address account) public view returns (bool) {
        return balanceOf(account) >= postThreshold;
    }

    function canComment(address account) public view returns (bool) {
        return balanceOf(account) >= commentThreshold;
    }

    // Allow minting by the owner
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
