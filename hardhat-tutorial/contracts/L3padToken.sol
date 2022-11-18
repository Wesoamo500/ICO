// SPDX-License-Identifier:MIT

pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ICryptoDevs.sol";


contract L3padToken is ERC20, Ownable{
    ICryptoDevs CryptoDevsNFT;

    mapping(uint256 => bool) public tokenIdsClaimed;

    constructor(address _cryptoDevsContract) ERC20("L3pad Token","LPD"){
        CryptoDevsNFT = ICryptoDevs(_cryptoDevsContract);
    }

    function claim() public{
        address sender = msg.sender;
        uint256 balance = CryptoDevsNFT.balanceOf(sender);
        require(balance > 0, "You don't own any Crypto Dev NFT's");
        uint256 amount = 0;
        for (uint256 i=0; i<balance;i++){
            uint256 tokenId = CryptoDevsNFT.tokenOfOwnerByIndex(sender, i);
            if(!tokenIdsClaimed[tokenId]){
                amount += 1;
                tokenIdsClaimed[tokenId] = true;
            }
        }
        require(amount > 0, "You have already Claimed all your tokens");
    }
}