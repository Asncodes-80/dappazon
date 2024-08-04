import chai from "chai";

const { expect } = chai;

describe("Dappazon", function () {
  let dappazon;
  beforeEach(async () => {
    const DappazonProvider = await ethers.getContractFactory("Dappazon");
    dappazon = await DappazonProvider.deploy();
  });

  describe("Deployment", () => {
    it("Has a name", async () => {
      const name = await dappazon.name();
      console.log(name);
      expect(name).to.equal("Dappazon");
    });
  });
});
