import './Create_NFT.css';
import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import axios from 'axios'; //axios -> client side (react)  <----- bridge -----> server side (Pinata)
import { ethers } from "ethers";
import Navbar from './Navbar';

let Sell_NFT = ({contract, account}) =>
{


    let [formParams, updateFormParams] = useState({ name: '', description: ''});
    let [fileURL, setFileURL]          = useState(null);
    let [message, updateMessage]       = useState('');
    


//________________________________Pinata______________________________________________________________________________________________________________________________________
   
    let secret   = ``;  // Pinata Sceret Key
    let key      = ``;  // Pinata api Key



//________________________________using Pinata Documentation______________________________________________________________________________________________________________________________________    

let Upload_JSON_to_IPFS = async(JSONBody) => 
{
        let url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;    // axios POST  -----> request to  ----> Pinata
        return axios 
            .post(url, JSONBody, {
                headers: {pinata_api_key: key,pinata_secret_api_key: secret,}
            })
            .then(function (response) {
               return {success: true,pinataURL: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash };
            })
            .catch(function (error) {console.log(error);return {success: false,message: error.message,}
    
        });
};




let Upload_File_to_IPFS = async(file) => 
{
    let url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;      // axios POST  -----> request to  ----> Pinata
    let data = new FormData();
    data.append('file', file);
    let metadata = JSON.stringify({name: 'testname',keyvalues: {exampleKey: 'exampleValue'}});
    data.append('pinataMetadata', metadata);
     // optional
    let pinataOptions = JSON.stringify({cidVersion: 0,customPinPolicy: {regions: [{ id: 'FRA1', desiredReplicationCount: 1 },{ id: 'NYC1', desiredReplicationCount: 2 }]}});
    data.append('pinataOptions', pinataOptions);

    return axios 
        .post(url, data, {
            maxBodyLength: 'Infinity',
            headers: {'Content-Type': `multipart/form-data; boundary=${data._boundary}`,pinata_api_key: key,pinata_secret_api_key: secret,}
        })
        .then(function (response) 
        {
            console.log("Image is uploaded", response.data.IpfsHash)
            return{success: true,pinataURL: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash};
        })
        .catch(function (error) 
        {
            console.log(error)
            return{success: false,message: error.message,}
        });
};





let Upload_Metadata_to_IPFS = async() =>
{
    let {name, description} = formParams;
    if( !name || !description || !fileURL) {updateMessage("Please fill all the fields!");return -1;}
    let NFT_JSON = {name, description, image: fileURL }
    try
    {
        let response = await Upload_JSON_to_IPFS(NFT_JSON);          // upload the metadata JSON to IPFS
        if(response.success === true) 
            {
                console.log("Uploaded JSON to Pinata: ", response);
                return response.pinataURL;
            }
    }
    catch(e) {console.log("error uploading JSON metadata:", e)}
}


async function listNFT(e) {
    e.preventDefault();

    //Upload data to IPFS
    try {
        let metadataURL = await Upload_Metadata_to_IPFS();
        if(metadataURL === -1)
        {
            console.log("-1")
            return;
        }
        else
        {
            Disable_Button();
            updateMessage("Uploading NFT(takes 2 mins).. please dont click anything!")

            console.log("metadataURL ======",metadataURL)
            let transaction = await contract.Mint_NFT(metadataURL)
            await transaction.wait()

            alert("Successfully Minted your NFT!");
            Enable_Button();
            updateMessage("");
            updateFormParams({ name: '', description: ''});
        }

    }
    catch(e) 
    {
        alert( "Upload error"+e )
    }
}

    async function Disable_Button() 
    {
        let listButton = document.getElementById("id_1")
        listButton.disabled = true
        listButton.style.backgroundColor = "grey";
        listButton.style.opacity = 0.3;
    }

    async function Enable_Button() 
    {
        let listButton = document.getElementById("id_1")
        listButton.disabled = false
        listButton.style.backgroundColor = "#A500FF";
        listButton.style.opacity = 1;
    }


    let On_Change_File =async (e) =>
    {
        var file = e.target.files[0];
        try                                   // File upload to IPFS
        {
            Disable_Button(); 
            updateMessage("Uploading image.... ")
            let response = await Upload_File_to_IPFS(file);
            if(response.success === true) 
            {
                Enable_Button();
                updateMessage("")
                alert("Uploaded image to Pinata ", response.pinataURL)
                setFileURL(response.pinataURL);
            }
        }
        catch(e) 
        {
            console.log("Error during file upload", e);
        }
    }

    return(
        <>
            <Navbar account ={account}/>
            <div  id="class_1">
            <form >
                <h3 >NFT Minter</h3>
                <div >
                    <label  htmlFor="name">NFT Name</label>
                    <input  id="name" type="text" placeholder="NFT#1" onChange={e => updateFormParams({...formParams, name: e.target.value})} value={formParams.name}></input>
                </div>
                <div >
                    <label  htmlFor="description">NFT Description</label>
                    <textarea  cols="40" rows="5" id="description" type="text" placeholder="Dog NFT Collection" value={formParams.description} onChange={e => updateFormParams({...formParams, description: e.target.value})}></textarea>
                </div>


                <div>
                    <label className="class_1" htmlFor="image">Upload Image (&lt;550 KB)</label>
                    <input type={"file"} onChange={On_Change_File}></input>
                </div>
                <br></br>
                <div className="class_185">{message}</div>
                <button onClick={listNFT}  id="id_1">
                Mint NFT
            </button>
                </form>
            </div>
        
        </>
        )

}
export default Sell_NFT;

