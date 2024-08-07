import { ethers } from "ethers";
import React from "react";

import { Product as IProduct, Product, ProductCategory } from "../interfaces";

const ProductView = ({
  category,
  products,
  account,
  provider,
  dappazon,
}: {
  products: ProductCategory;
  category: keyof ProductCategory;
  account: string;
  provider: ethers.providers.Web3Provider | undefined;
  dappazon: ethers.Contract | undefined;
}): JSX.Element => {
  const [order, setOrder] = React.useState(null);
  const [hasBought, setHasBought] = React.useState(false);
  const [lastId, setLastId] = React.useState<number>(0);

  const fetchDetails = async () => {
    const events: ethers.Event[] | undefined = await dappazon?.queryFilter(
      "Buy"
    );
    const orders = events?.filter(
      (event) =>
        event?.args?.buyer === account &&
        event?.args?.orderId.toString() === item
    );

    if (orders?.length === 0) return;

    const order = await dappazon.orders(account, orders[0].args.orderId);
    // console.log(order);
    setOrder(order);
  };

  /** Buy product through spending Ethers */
  const buyItem = async (item: Product) => {
    setLastId(item.id);
    const signer = await provider?.getSigner();

    let transaction = await dappazon
      ?.connect(signer!)
      .buy(item.id, { value: item.cost });
    await transaction.wait();
    setHasBought(true);
    fetchDetails();
  };

  React.useEffect(() => {
    fetchDetails();
  }, [hasBought]);

  return (
    <div className="categoryCard">
      <h3>
        {category.charAt(0).toUpperCase()}
        {category.substring(1)}
      </h3>
      <div className="productsHolder">
        {products[category].map((item: IProduct, index: number) => (
          <div className="productCard" key={index}>
            <img
              src={item.image}
              width="240px"
              alt={`image of ${item.name} product id: #${item.id}`}
            />
            <h3>{item.name}</h3>
            <div className="meta">
              <span
                style={{
                  color: item.stock > 0 ? "inherit" : "red",
                }}
              >
                {item.stock > 0 ? "In stock" : "Out of stock"}
              </span>
              <span>Rate: {String(item.rating)}/5</span>
            </div>
            {order && (
              <div>
                Item bought on <br />
                <strong>
                  {new Date(
                    Number(order.time.toString() + "000")
                  ).toLocaleDateString(undefined, {
                    weekday: "long",
                    hour: "numeric",
                    minute: "numeric",
                    second: "numeric",
                  })}
                </strong>
              </div>
            )}
            <button disabled={item.stock == 0} onClick={() => buyItem(item)}>
              Buy
              <span>
                {ethers.utils.formatUnits(item.cost.toString(), "ether")} ETH
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductView;
