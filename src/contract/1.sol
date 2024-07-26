//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

// v 4.0
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v4.0/contracts/token/ERC721/ERC721.sol";                           // ERC721
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v4.0/contracts/token/ERC721/extensions/ERC721URIStorage.sol";     //  ERC721URIStorage
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v4.0/contracts/utils/Counters.sol";                              //   Counters


contract NFTMarketplace is ERC721URIStorage 
{
    using Counters for Counters.Counter;    // used for tracking token_IDs + Safe way to increment/decrement + also cost less gas because of unchecked opcode used in Counters Library
    Counters.Counter private Token_IDs;
    Counters.Counter private Item_Sold;
    address payable owner;
    uint256 List_Price = 0.000001 ether;
    // you can also add royalty variable if you want


    struct Token_struct 
    {
        uint256 tokenId;
        address payable owner;
        address payable seller;
        uint256 price;
        bool Is_Listed;              
    }

    event Create_NFT_Success (uint256 indexed tokenId, address owner,address seller, uint256 price,bool Is_Listed );  // Indexed Keyword  -> used in events + reduce time compexity for fast quering/searching  
    
    mapping(uint256 => Token_struct) private Token_map;  

    constructor() ERC721("NFTMarketplace", "NFTM") 
    {
        owner = payable(msg.sender);
    }

    function Mint_NFT(string memory tokenURI) public  returns (uint) 
    {
        Token_IDs.increment();
        uint256 newTokenId = Token_IDs.current();

        _safeMint(msg.sender, newTokenId);     // _safeMint  provide Safety Check for recipient
        _setTokenURI(newTokenId, tokenURI);   // checking for  MetadataURI or tokenURI  is valid or not

        Create_NFT(newTokenId);
        return newTokenId;
    }


    function List_NFT(uint256 tokenId,uint256 price_) payable public 
    {
        require(price_ > 0, "Make sure the price isn't negative");
        require(msg.value == List_Price, "Hopefully sending the correct price");
        require(Token_map[tokenId].seller == msg.sender);  //  <<<< require(Token_map[tokenId].seller == msg.sender && Token_map[tokenId].Is_Listed == false ); 
        Token_map[tokenId].price = price_;
        Token_map[tokenId].Is_Listed = true;
    }

    function Remove_NFT_From_Listed(uint256 tokenId) payable public   // Remove from Market / Withdraw Listing
    {
        require(Token_map[tokenId].seller == msg.sender);
        Token_map[tokenId].price = 0;
        Token_map[tokenId].Is_Listed = false;
    }

    function Create_NFT(uint256 tokenId) private 
    {
        Token_map[tokenId] = Token_struct(
            tokenId,
            payable(address(this)),
            payable(msg.sender),
            0,                                                     // -1 / int max / 0
            false
        );

        //           from          to 
        _transfer(msg.sender, address(this), tokenId);      //  msg.sender    ---->    contract 

        emit Create_NFT_Success(tokenId , address(this) , msg.sender , 0 , false );
    } 

    function Buy_NFT(uint256 tokenId) public payable 
    {
        uint price = Token_map[tokenId].price;
        address seller = Token_map[tokenId].seller;
        require(msg.value == price, "submit the asking price");

        Token_map[tokenId].Is_Listed = false;
        Token_map[tokenId].seller = payable(msg.sender);   
        Item_Sold.increment();

         //        from            to
        _transfer(address(this), msg.sender, tokenId);     //  msg.sender    ---->    contract 
        approve(address(this), tokenId);                  //   msg.sender   ----approve-----> contract      
        payable(owner).transfer(List_Price);

        payable(seller).transfer(msg.value);
        // we can also add royalty pay here if you want 
    }

    function Get_All_Listed_NFTs() public view returns (Token_struct[] memory) 
    {
        uint nftCount = Token_IDs.current();
        uint total_true = 0;
        
        
        for (uint i = 1; i <= nftCount; i++)              // Counting the total number of listed NFTs
        {
            if (Token_map[i].Is_Listed == true) 
            {
                total_true++;
            }
        }

        Token_struct[] memory tokens = new Token_struct[](total_true);   // we can't use Dynamic array with memory Keword 
        uint currentIndex = 0;

        for (uint i = 1; i <= nftCount; i++) 
        {
            if (Token_map[i].Is_Listed == true) 
            {
                Token_struct storage currentItem = Token_map[i];
                tokens[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return tokens;
}

    
    function Get_My_NFTs() public view returns (Token_struct[] memory)  // String , Struct, etc   by they  default store in Contract Storage and to this defualt  we need to use memork keyword 
    {
        uint totalItemCount = Token_IDs.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        
        for (uint i = 1; i <= totalItemCount; i++)     // Counting the number of NFTs which i own
        {
            if (Token_map[i].seller == msg.sender) 
            {
                itemCount++;
            }
        }

        Token_struct[] memory items = new Token_struct[](itemCount);  // we can't use Dynamic array with memory Keword 

        for (uint i = 1; i <= totalItemCount; i++) 
        {
            if (Token_map[i].seller == msg.sender) 
            {
                Token_struct storage currentItem = Token_map[i];
                items[currentIndex] = currentItem;
                currentIndex++;
            }
        }

        return items;
    }

    function Get_Token_map_by_Token_ID(uint256 tokenId) public view returns (Token_struct memory)  //****************************
    {
        return Token_map[tokenId];
    }


    function Update_Listed_Price(uint256 _listPrice) public payable 
    {
        require(owner == msg.sender, "Only owner can update listing price");  // only owner can do this 
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

    function getCurrentToken() public view returns (uint256) 
    {
        return Token_IDs.current();
    }


}
