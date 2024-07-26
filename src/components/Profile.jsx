import { useLocation, useParams } from 'react-router-dom';
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from 'axios';
import './Profile.css'; // Import the CSS file
import NFTTile from "./NFTTile";
import Navbar from './Navbar';

let Profile = ({contract, account}) => 
{
    let [data, Update_Data_func]                 = useState([]);
    let [Data_Fetched_i, Update_Fetched_func]    = useState(false);
    let [address, Update_Address_func]           = useState("0x");
    let [Total_Price_i, Update_Total_Price_func] = useState("0");

    let Get_NFT_Data = async(tokenId)=>
    {
        let sumPrice = 0;
        let transaction = await contract.Get_My_NFTs();
        let items = await Promise.all(transaction.map(async i => 
        {
            let Token_URI = await contract.tokenURI(i.tokenId);
            let j = await axios.get(Token_URI);
            j = j.data;

            let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
            let item = {
                            price,
                            tokenId: i.tokenId.toNumber(),
                            seller: i.seller,
                            owner: i.owner,
                            image: j.image,
                            name: j.name,
                            description: j.description,
                       };

            sumPrice += Number(price);
            return item;

        }));

        Update_Data_func(items);
        Update_Fetched_func(true);
        Update_Address_func(account);
        Update_Total_Price_func(sumPrice.toPrecision(3));
    }

    let params = useParams();
    let tokenId = params.tokenId;

    useEffect(() => {
        if (!Data_Fetched_i && contract) 
        {
            Get_NFT_Data(tokenId);
        }
    }, [Data_Fetched_i, contract]);

    return (
        <>
            <Navbar account ={account}/>
            <div className="class__1">
                <div className="class_180o"> <h2>Wallet Address</h2> <p>{address}</p></div>
                <div className="class_180o"><h2>No. of NFTs</h2><p>{data.length}</p></div>
                <div className="class_180o"><h2>Total Value</h2><p>{Total_Price_i} ETH</p></div>
                <div className="class_180o"><h2>Your NFTs</h2>
                <div className="nft-grid">
                        {data.map((value, index) => (
                            <div className="class_181" key={index}>
                                <NFTTile data={value}  key={index} />
                            </div>
                        ))}
                </div> {data.length === 0 && (<div className="class_180o"><p>Oops, No NFT data to display (Are you logged in??)</p> </div>)} </div>
            </div>
        </>
    );
}

export default Profile;
