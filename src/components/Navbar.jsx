import { Link, useLocation } from 'react-router-dom';
import './Navbar.css'; 

let Navbar = ({ account }) => {
  let location = useLocation();

  let Nav_Items = 
  [
    { path: "/", label: "Marketplace" },
    { path: "/Create_NFT", label: "Mint NFT" },
    { path: "/profile", label: "Profile" }
  ];

  return (
    <>
      <nav className="class_194">
        <Link to="/" className="class_195">NFT Marketplace</Link>
        <ul className="class_196">
          {Nav_Items.map(({ path, label }) => (
            <li
              key={path}
              className={`nav-item ${location.pathname === path ? 'active' : ''}`}>
              <Link to={path} className="class_197">{label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default Navbar;
