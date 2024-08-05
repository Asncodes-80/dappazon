import { ethers } from "ethers";
import React from "react";

import "./App.css";
import Dappazon from "../artifacts/contracts/Dappazon.sol/Dappazon.json";
import config from "./config.json";

interface Product {
  id: number;
  name: string;
  category: string;
  image: string;
  cost: any;
  rating: number;
  stock: number;
}

interface ProductCategory {
  electronics: Product[];
  clothing: Product[];
  toys: Product[];
}

function App() {
  const [account, setAccount] = React.useState<string>("");
  const [provider, setProvider] =
    React.useState<ethers.providers.Web3Provider>();
  const [dappazon, setDappazon] = React.useState<ethers.Contract>();

  const [products, setProducts] = React.useState<ProductCategory>({
    electronics: [],
    clothing: [],
    toys: [],
  });

  const loadBlockchainData = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setAccount(ethers.utils.getAddress(accounts[0]));
  };

  const loadProducts = async () => {
    // Connect to Blockchain
    const provider: ethers.providers.Web3Provider =
      new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);
    // const network: ethers.providers.Network = await provider.getNetwork();

    // Conneect to Smart Contract
    const dappazon: ethers.Contract = new ethers.Contract(
      config["31337"].dappazon.address,
      Dappazon.abi,
      provider
    );
    setDappazon(dappazon);

    const items = [];
    for (let i = 0; i < 9; i++) {
      items.push(await dappazon.products(i + 1));
    }

    setProducts({
      electronics: items.filter((item) => item.category === "electronics"),
      clothing: items.filter((item) => item.category === "clothing"),
      toys: items.filter((item) => item.category === "toys"),
    });
  };

  React.useEffect(() => {
    loadProducts();
  }, []);

  console.log();

  return (
    <>
      <h1>Dappazon</h1>
      <h5>{account}</h5>
      <button onClick={() => loadBlockchainData()}>Connect</button>

      <h2>Products</h2>
      <ProductViewer products={products} category="electronics" />
      <ProductViewer products={products} category="clothing" />
      <ProductViewer products={products} category="toys" />
    </>
  );
}

const ProductViewer = ({
  category,
  products,
}: {
  products: ProductCategory;
  category: keyof ProductCategory;
}): JSX.Element => {
  return (
    <div>
      <h3>
        {category.charAt(0).toUpperCase()}
        {category.substring(1)}
      </h3>
      {products[category].map((item: Product) => (
        <div>
          <img
            src={item.image}
            alt={`image of ${item.name} product id: #${item.id}`}
          />
          <p>{String(item.id)}</p>
          <h3>{item.name}</h3>
          <h4>
            Price:
            {ethers.utils.formatUnits(item.cost.toString(), "ether")} ETH
          </h4>
          <span>
            Remaining:{String(item.stock)} - Rate: {String(item.rating)}/5
          </span>
        </div>
      ))}
    </div>
  );
};

export default App;
