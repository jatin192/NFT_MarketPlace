import { useLocation, useParams } from 'react-router-dom';
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from 'axios';
import './NFTPage.css'; 
import Navbar from './Navbar';

let NFTPage = ({ contract, account }) => 
{

      let Get_IPFS_URL_From_Pinata = (pinataUrl) => 
      {
          var IPFSUrl = pinataUrl.split("/");
          let lastIndex = IPFSUrl.length;
          IPFSUrl = "https://gateway.pinata.cloud/ipfs/" + IPFSUrl[lastIndex - 1];
          console.log("IPFSURL =", IPFSUrl);
          return IPFSUrl;
      };


      let [data, updateData]                     = useState({});
      let [Data_Fetched_i, Update_Data_Fetched_func]    = useState(false);
      let [message, Update_Message_func]               = useState("");
      let [currAddress, updateCurrAddress]       = useState("0x");
      let [price_i, setPrice] = useState(""); 
      let [listedToken, setListedToken]          = useState({}); 



      let  getNFTData = async(tokenId) =>
      {
          var tokenURI    = await contract.tokenURI(tokenId);
          let listedToken = await contract.Get_Token_map_by_Token_ID(tokenId);
          setListedToken(listedToken); 
          tokenURI       = Get_IPFS_URL_From_Pinata(tokenURI);
          let meta       = await axios.get(tokenURI);

          meta = meta.data;
          console.log(listedToken);

          let item = 
          {
              price:       ethers.utils.formatUnits(listedToken.price.toString(), 'ether'),
              tokenId:     tokenId,
              seller:      listedToken.seller,
              owner:       listedToken.owner,
              image:       meta.image,
              name:        meta.name,
              description: meta.description,
          }
          console.log(item);
          updateData(item);
          Update_Data_Fetched_func(true);
          updateCurrAddress(account);
      }

      let List_NFT = async(tokenId, price_) =>
      {
          try 
          {
              let listingPrice = await contract.Get_List_Price()
              listingPrice = listingPrice.toString()

              let price = ethers.utils.parseUnits(price_, 'ether')

              Update_Message_func("Listing the NFT... Please Wait (Upto 2 mins)");
              let transaction = await contract.List_NFT(tokenId, price_, { value: listingPrice });

              await transaction.wait();

              alert('You successfully listed the NFT!');
              Update_Message_func("");
          }
          catch (e) 
          {
              alert("Upload Error" + e);
          }
      }

      let Buy_NFT = async(tokenId) =>
      {
          try 
          {
              Update_Message_func("Buying the NFT... Please Wait (Upto 2 mins)");
              let priceInWei = ethers.utils.parseUnits(data.price.toString(), 'ether');

              let transaction = await contract.Buy_NFT(tokenId, {
                                                                      value: priceInWei,
                                                                      gasLimit: 7000000
                                                                    });
                                                                    
              await transaction.wait()
              alert('You successfully bought the NFT!');
              Update_Message_func("");
          }
          catch (e) 
          {
              alert("Upload Error" + e);
          }
      }

      let params = useParams();
      let tokenId = params.tokenId;
      if (!Data_Fetched_i)
      {
          getNFTData(tokenId);
      }
        
      if (typeof data.image == "string")
      {
        data.image = Get_IPFS_URL_From_Pinata(data.image);
      }

  return (
    <>
      <Navbar account={account} />
      <div className="class_1"><h1></h1> <p></p></div>
        <div className="class_1234">
          <img src={data.image}  className="class2231" />
          <div className="class_123">
            <div className="title">
              Name: {data.name}
            </div>
            <div className="class_198"> Description: {data.description}</div>
            <div className="class_123">Price: <span className="class223">{data.price + " ETH"}</span></div>
            <div className="class_123"> Owner: <span className="class2232">{data.owner}</span></div>
            <div className="class_123">Seller: <span className="class2233">{data.seller}</span></div>
            <div>
              {    currAddress !== data.seller    ?    <button className="button" onClick={() => Buy_NFT(tokenId)}>Buy this NFT</button>      :     <div></div>  }

              {    currAddress === data.seller && listedToken.Is_Listed === false ?
                <div>
                    <input type="number" placeholder="Enter Price" value={price_i} onChange={(e) => setPrice(e.target.value)} />
                    <button className="class2234" onClick={() => List_NFT(tokenId, price_i)}>List this NFT</button>
                </div>
                : <div></div>
              }

            </div>
            <div className="class2235">{message}</div>
          </div>
        </div>
    </>
  )
}

export default NFTPage;
