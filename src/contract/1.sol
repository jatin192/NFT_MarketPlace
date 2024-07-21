//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v4.0/contracts/token/ERC721/ERC721.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v4.0/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v4.0/contracts/utils/Counters.sol";

contract NFTMarketplace is ERC721URIStorage 
{

    using Counters for Counters.Counter;
    Counters.Counter private Token_IDs;
    Counters.Counter private Item_Sold;
    address payable owner;
    uint256 List_Price = 0.0001 ether;

    struct Token_struct 
    {
        uint256 tokenId;
        address payable owner;
        address payable seller;
        uint256 price;
        bool Is_Listed;
    }

    event Create_NFT_Success (uint256 indexed tokenId, address owner,address seller, uint256 price,bool Is_Listed );

    mapping(uint256 => Token_struct) private Token_map;

    constructor() ERC721("NFTMarketplace", "NFTM") 
    {
        owner = payable(msg.sender);
    }

    function Mint_NFT(string memory tokenURI) public  returns (uint) 
    {
        Token_IDs.increment();
        uint256 newTokenId = Token_IDs.current();
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        Create_NFT(newTokenId);
        return newTokenId;
    }


    function List_NFT(uint256 tokenId,uint256 price_) payable public 
    {
        require(price_ > 0, "Make sure the price isn't negative");
        require(msg.value == List_Price, "Hopefully sending the correct price");
        require(Token_map[tokenId].seller == msg.sender);
        Token_map[tokenId].price = price_;
        Token_map[tokenId].Is_Listed = true;
    }

    function Remove_NFT_From_Listed(uint256 tokenId) payable public 
    {
        require(Token_map[tokenId].seller == msg.sender);
        Token_map[tokenId].price = 0;
        Token_map[tokenId].Is_Listed = false;
    }

    function Create_NFT(uint256 tokenId) private {
        Token_map[tokenId] = Token_struct(
            tokenId,
            payable(address(this)),
            payable(msg.sender),
            0,                                                     // -1 / int max / 0 
            false
        );

        _transfer(msg.sender, address(this), tokenId);

        emit Create_NFT_Success(
            tokenId,
            address(this),
            msg.sender,
            0,
            false
        );
    }

    function Buy_NFT(uint256 tokenId) public payable 
    {
        uint price = Token_map[tokenId].price;
        address seller = Token_map[tokenId].seller;
        require(msg.value == price, "submit the asking price");

        Token_map[tokenId].Is_Listed = false;
        Token_map[tokenId].seller = payable(msg.sender);
        Item_Sold.increment();

        _transfer(address(this), msg.sender, tokenId);
        approve(address(this), tokenId);
        payable(owner).transfer(List_Price);

        payable(seller).transfer(msg.value);
    }

    function Get_All_Listed_NFTs() public view returns (Token_struct[] memory) 
    {
        uint nftCount = Token_IDs.current();
        uint total_true = 0;
        for(uint i=0;i<nftCount;i++)
        {
            if(Token_map[i+1].Is_Listed == true)
            {
                total_true++;
            }
        }
        
        Token_struct[] memory tokens = new Token_struct[](total_true);
        uint currentIndex = 0;
        uint currentId;

        for(uint i=0;i<total_true;i++)
        {
            if(Token_map[i+1].Is_Listed == true)
            {
                currentId = i + 1;
                Token_struct storage currentItem = Token_map[currentId];
                tokens[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return tokens;
    }
    

    function Get_My_NFTs() public view returns (Token_struct[] memory) {
        uint totalItemCount = Token_IDs.current();
        uint itemCount = 0;
        uint currentIndex = 0;
        uint currentId;
        for(uint i=0; i < totalItemCount; i++)
        {
            if(Token_map[i+1].seller == msg.sender)
            {
                itemCount += 1;
            }
        }
        Token_struct[] memory items = new Token_struct[](itemCount);
        for(uint i=0; i < totalItemCount; i++) 
        {
            if(Token_map[i+1].seller == msg.sender) {
                currentId = i+1;
                Token_struct storage currentItem = Token_map[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

        function Update_Listed_Price(uint256 _listPrice) public payable 
    {
        require(owner == msg.sender, "Only owner can update listing price");
        List_Price = _listPrice;
    }


    function Get_List_Price() public view returns (uint256) 
    {
        return List_Price;
    }


    function getLatestIdToListedToken() public view returns (Token_struct memory) 
    {
        uint256 currentTokenId = Token_IDs.current();
        return Token_map[currentTokenId];
    }


    function Get_Token_map_by_Token_ID(uint256 tokenId) public view returns (Token_struct memory) 
    {
        return Token_map[tokenId];
    }


    function getCurrentToken() public view returns (uint256) 
    {
        return Token_IDs.current();
    }

}
