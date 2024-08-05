// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.24;

contract Dappazon {
    address public owner;

    /// Single product structure
    struct Product {
        uint256 id;
        string name;
        string category;
        string image;
        uint256 cost;
        uint256 rating;
        uint256 stock;
    }

    struct Order {
        uint256 time;
        Product item;
    }

    /// List of products
    mapping(uint256 => Product) public products;

    /// List of orders
    mapping(address => uint256) public orderCount;

    mapping(address => mapping(uint256 => Order)) public orders;

    event List(string name, uint256 cost, uint256 qty);
    event Buy(address buyer, uint256 orderId, uint256 itemId);

    modifier onlyOwner() {
        require(owner == msg.sender);
        _;
    }

    modifier canBuy(uint256 itemValue, uint256 itemStock) {
        require(itemStock > 0);
        require(msg.value >= itemValue);
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /// Returns list of products
    function list(
        uint256 _id,
        string memory _name,
        string memory _category,
        string memory _image,
        uint256 _cost,
        uint256 _rating,
        uint256 _stock
    ) public onlyOwner {
        Product memory productItem = Product(
            _id,
            _name,
            _category,
            _image,
            _cost,
            _rating,
            _stock
        );

        products[_id] = productItem;
        emit List(_name, _cost, _stock);
    }

    /// Buy products
    function buy(
        uint256 _id
    ) public payable canBuy(products[_id].cost, products[_id].stock) {
        // Receive crypto is payable function

        // Fetch item (Choosed product)
        Product memory item = products[_id];

        // Create an order
        Order memory order = Order(block.timestamp, item);

        // Add order for user
        orderCount[msg.sender] += 1;
        // Which product added? (With meta data)
        orders[msg.sender][orderCount[msg.sender]] = order;

        // Update: subtract stock
        products[_id].stock = item.stock - 1;

        // Emit event
        emit Buy(msg.sender, orderCount[msg.sender], item.id);
    }

    /// Withdraw funds
    function withdraw() public onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success);
    }
}
