
pragma solidity ^0.4.24;

import './BBStandard.sol';


contract BBExpertHash is BBStandard {
	
	event SavingItemData(address indexed sender, bytes32 itemHash);

	function pushData(bytes32 itemHash) public {
		require(msg.sender != 0x0);

		bbs.setBytes( keccak256(abi.encodePacked('IPFS_HASH', msg.sender)),  abi.encodePacked(itemHash));

		emit SavingItemData(msg.sender, itemHash); 	
	}
}
