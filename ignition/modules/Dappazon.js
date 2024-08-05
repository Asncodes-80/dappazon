const hre = require("hardhat");
const { items } = require("../../src/items.json");

/** Converts to Wei */
const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

async function main() {
  // Account #0
  const [deployer] = await ethers.getSigners();

  // Deploy
  const Dappazon = await hre.ethers.getContractFactory("Dappazon");
  const dappazon = await Dappazon.deploy();
  await dappazon.deployed();

  console.log(`Deployed Dappazon Contract at: ${dappazon.address}\n`);

  // List items
  items.forEach(async (item) => {
    const transaction = await dappazon
      .connect(deployer)
      .list(
        item.id,
        item.name,
        item.category,
        item.image,
        tokens(item.price),
        item.rating,
        item.stock
      );
    await transaction.wait();

    console.log(`Listed item ${item.id}: ${item.name}`);
  });
}

main().catch((error) => {
  console.log(error);
  process.exitCode = 1;
});
