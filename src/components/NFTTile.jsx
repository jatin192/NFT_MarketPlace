import { BrowserRouter as Router, Link } from "react-router-dom";
import './NFTTitle.css';

let NFTTile = (data) => {
    let newTo = {
        pathname: "/NFTPage/" + data.data.tokenId,
    };

    let Get_IPFS_From_Pinata = (pinataUrl) => {
        var IPFSUrl = pinataUrl.split("/");
        let lastIndex = IPFSUrl.length;
        IPFSUrl = "https://gateway.pinata.cloud/ipfs/" + IPFSUrl[lastIndex - 1];
        return IPFSUrl;
    };

    let IPFS_URL = Get_IPFS_From_Pinata(data.data.image);

    return (
        <>        
        <Link to={newTo}>
            <em>
                <img src={IPFS_URL} className="class_191" crossOrigin="anonymous" />
                <div className="">
                    <strong className="class_192">{data.data.name}</strong>
                    <p className="class_193">{data.data.price}ETH</p>
                </div>
            </em>
        </Link>
        <h1></h1><h1></h1>
        </>
    );
};

export default NFTTile;
