import { ethers } from "ethers";
import React from "react";

import "./App.css";
import Dappazon from "../artifacts/contracts/Dappazon.sol/Dappazon.json";
import config from "./config.json";
import { ProductCategory } from "./interfaces";
import ProductView from "./components/Product";

function App() {
  const wineth = (window as any).ethereum;
  const [account, setAccount] = React.useState<string>("");
  const [provider, setProvider] =
    React.useState<ethers.providers.Web3Provider>();
  const [dappazon, setDappazon] = React.useState<ethers.Contract>();

  const [products, setProducts] = React.useState<ProductCategory>({
    electronics: [],
    clothing: [],
    toys: [],
  });

  const connectToWallet = async () => {
    const accounts = await wineth.request({
      method: "eth_requestAccounts",
    });
    setAccount(ethers.utils.getAddress(accounts[0]));
  };

  const loadProducts = async () => {
    // Connect to blockchain with wallet intermediation.
    const provider: ethers.providers.Web3Provider =
      new ethers.providers.Web3Provider(wineth);
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
    connectToWallet();
    loadProducts();
  }, []);

  return (
    <React.Fragment>
      <div className="header">
        <h1>Dappazon</h1>
        <h5>{account}</h5>
        <button onClick={() => connectToWallet()}>Connect</button>
      </div>

      {["clothing", "electronics", "toys"].map(
        (item: string, index: number) => (
          <ProductView
            key={index}
            products={products}
            category={item as keyof ProductCategory}
            account={account}
            provider={provider}
            dappazon={dappazon}
          />
        )
      )}
    </React.Fragment>
  );
}

export default App;
