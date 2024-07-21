import './MarketPlace.css';
import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import axios from 'axios'; //axios -> client side (react)  <----- bridge -----> server side (Pinata)
import { ethers } from "ethers";
import NFTTile from "./NFTTile";
import Navbar from "./Navbar";
let MarketPlace = ({contract, account}) =>
{
    let d = [                                                                                                               // sample data
        {
            "name": "NFT_1",
            "description": "Dog NFT",
            "website":"http://google.com",
            "image":"https://gateway.pinata.cloud/ipfs/QmWPcYH9e1nXvyx5pp2AgpQAQTTrozFofRH6F1kqpD225p",
            "price":"0.00002ETH",
            "currentlySelling":"True",
            "address":"0x3d22f2B4b5f885B7D6c81d510E261f01b0Ef2C0f",
        }
    ];

    let GetIpfsUrlFromPinata = (pinataUrl) => 
        {
            var IPFSUrl = pinataUrl.split("/");
            let lastIndex = IPFSUrl.length;
            IPFSUrl = "https://gateway.pinata.cloud/ipfs/"+IPFSUrl[lastIndex-1];
            console.log("IPFSURL =",IPFSUrl);
            return IPFSUrl;
        };

    let [data, Update_Data_func] = useState(d);
    let [Data_Fetched_i, Update_Fetched_func] = useState(false);


    async function getAllNFTs_() 
    {
        let transaction = await contract.Get_All_Listed_NFTs();
    
        //Fetch all the details of every NFT from the contract and display
        let items = await Promise.all(transaction.map(async i => 
        {
            
            var tokenURI = await contract.tokenURI(i.tokenId);
            console.log("getting this tokenUri", tokenURI);
            tokenURI = GetIpfsUrlFromPinata(tokenURI);
            let meta = await axios.get(tokenURI);
            meta = meta.data;
    
            let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
            let item = 
            {
                price,
                tokenId: i.tokenId.toNumber(),
                seller: i.seller,
                owner: i.owner,
                image: meta.image,
                name: meta.name,
                description: meta.description,
            }
            return item;
        }))
    
        Update_Fetched_func(true);
        Update_Data_func(items);
    }

    useEffect(() => {
        if (!Data_Fetched_i && contract) {
            getAllNFTs_();
        }
    }, [Data_Fetched_i, contract]);


return (
    <>
        <Navbar />
        <h1 className='class_1'>Top NFTs</h1>
        <div className="class_2">
            {data.map((value, index) => {
                return <NFTTile data={value} key={index} className="class_3" />;
            })}
        </div>
    </>
);

}
export default MarketPlace;