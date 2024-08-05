import chai from "chai";

const { expect } = chai;

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

const SAMPLE_ITEM = {
  id: 1,
  name: "Shoes",
  category: "Clothing",
  image:
    "https://ipfs.io/ipfs/QmTYEboq8raiBs7GTUg2yLXB3PMz6HuBNgNfSZBx5Msztg/shoes.jpg",
  cost: tokens(1),
  rating: 4,
  stock: 5,
};

describe("Dappazon", function () {
  /** Instance of smart contract */
  let dappazon;

  /** Who is deploying smart contract? */
  let deployer;

  /** Who is running the function from smart contract? */
  let buyer;

  beforeEach(async () => {
    [deployer, buyer] = await ethers.getSigners();
    const DappazonProvider = await ethers.getContractFactory("Dappazon");
    dappazon = await DappazonProvider.deploy();
  });

  describe("Deployment", () => {
    it("Sets the owner", async () => {
      const owner = await dappazon.owner();
      expect(owner).to.equal(deployer.address);
    });
  });

  describe("Listing", () => {
    let transaction;

    beforeEach(async () => {
      transaction = await dappazon
        .connect(deployer)
        .list(
          SAMPLE_ITEM.id,
          SAMPLE_ITEM.name,
          SAMPLE_ITEM.category,
          SAMPLE_ITEM.image,
          SAMPLE_ITEM.cost,
          SAMPLE_ITEM.rating,
          SAMPLE_ITEM.stock
        );

      await transaction.wait();
    });

    it("Returns item attributes", async () => {
      const item = await dappazon.products(SAMPLE_ITEM.id);
      expect(item.id).to.equal(SAMPLE_ITEM.id);
      expect(item.name).to.equal(SAMPLE_ITEM.name);
      expect(item.category).to.equal(SAMPLE_ITEM.category);
      expect(item.image).to.equal(SAMPLE_ITEM.image);
      expect(item.cost).to.equal(SAMPLE_ITEM.cost);
      expect(item.rating).to.equal(SAMPLE_ITEM.rating);
      expect(item.stock).to.equal(SAMPLE_ITEM.stock);
    });

    it("Emits list event", () => {
      // Which provider (Contract) and what is emit type.
      expect(transaction).to.emit(dappazon, "List");
    });
  });

  describe("Buying", () => {
    let transaction;

    beforeEach(async () => {
      transaction = await dappazon
        .connect(deployer) // It's owner of contract state variable.
        .list(
          SAMPLE_ITEM.id,
          SAMPLE_ITEM.name,
          SAMPLE_ITEM.category,
          SAMPLE_ITEM.image,
          SAMPLE_ITEM.cost,
          SAMPLE_ITEM.rating,
          SAMPLE_ITEM.stock
        );

      await transaction.wait();

      transaction = await dappazon
        .connect(buyer)
        .buy(SAMPLE_ITEM.id, { value: SAMPLE_ITEM.cost });
    });

    it("Updates the contract balance", async () => {
      const result = await ethers.provider.getBalance(dappazon.address);
      expect(result).to.equal(SAMPLE_ITEM.cost);
    });

    it("Updates buyer's order count", async () => {
      const result = await dappazon.orderCount(buyer.address);
      expect(result).to.equal(1);
    });

    it("Adds the order", async () => {
      // order[buyer.address][1]
      const order = await dappazon.orders(buyer.address, 1);

      expect(order.time).to.be.greaterThan(0);
      expect(order.item.name).to.equal(SAMPLE_ITEM.name);
    });

    it("Updates the contract balance", async () => {
      // All
      const result = await ethers.provider.getBalance(dappazon.address);
      expect(result).to.equal(SAMPLE_ITEM.cost);
    });

    it("Emits buy event", () => {
      expect(transaction).to.emit(dappazon, "Buy");
    });
  });

  describe("Withdrawing", () => {
    let balanceBefore;

    beforeEach(async () => {
      // List a product
      let transaction = await dappazon
        .connect(deployer)
        .list(
          SAMPLE_ITEM.id,
          SAMPLE_ITEM.name,
          SAMPLE_ITEM.category,
          SAMPLE_ITEM.image,
          SAMPLE_ITEM.cost,
          SAMPLE_ITEM.rating,
          SAMPLE_ITEM.stock
        );

      await transaction.wait();

      // Buy a product
      transaction = await dappazon
        .connect(buyer)
        .buy(SAMPLE_ITEM.id, { value: SAMPLE_ITEM.cost });
      await transaction.wait();

      // Get deployer balance before
      balanceBefore = await ethers.provider.getBalance(deployer.address);

      // Withdraw
      transaction = await dappazon.connect(deployer).withdraw();
      await transaction.wait();
    });

    it("Updates the owner balance", async () => {
      const balanceAfter = await ethers.provider.getBalance(deployer.address);
      expect(balanceAfter).to.be.greaterThan(balanceBefore);
    });

    it("Updates the contract balance", async () => {
      const result = await ethers.provider.getBalance(dappazon.address);
      expect(result).to.equal(0);
    });
  });
});
