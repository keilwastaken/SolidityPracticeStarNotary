const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    // Arrange
    let tokenId = 1;
    let instance = await StarNotary.deployed();

    // Act
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    var createdStar = await instance.tokenIdToStarInfo.call(tokenId)
    // Assert
    assert.equal(createdStar, 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    // Arrange
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    
    // Act
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});

    // Assert
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    // Arrange
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    
    // Act
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);

    //Assert
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    // Arrange
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");

    // Act
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});

    // Assert
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    // Arrange
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");

    // Act
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);

    // Assert 
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    // Arrange
    let tokenId = 6;
    let instance = await StarNotary.deployed();
    
    // Act
    let name = await instance.name.call();
    let symbol = await instance.symbol.call();

    // Assert
    assert.equal(name, "Keils Genesis Token")
    assert.equal(symbol, "KGT")

    // 1. create a Star with different tokenId
    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
});

it('lets 2 users exchange stars', async() => {
    // Arrange
    let User1Token = 7;
    let User2Token = 8;
    let instance = await StarNotary.deployed();

    // Act
    await instance.createStar('User1 Star!', User1Token, {from: accounts[0]});
    await instance.createStar('User2 Star!', User2Token, {from: accounts[1]});

    await instance.exchangeStars(User1Token, User2Token, {from: accounts[0]});

    // Assert
    var user1Swap = await instance.ownerOf(User1Token);
    var user2Swap = await instance.ownerOf(User2Token);
    assert.notEqual(user1Swap, accounts[0]);
    assert.notEqual(user2Swap, accounts[1]);
    assert.equal(user1Swap, accounts[1]);
    assert.equal(user2Swap, accounts[0]);
});

it('lets 2 users exchange stars transfer must own star', async() => {
    // Arrange
    let User1Token = 9;
    let User2Token = 10;
    let instance = await StarNotary.deployed();

    // Act
    await instance.createStar('User1 Star!', User1Token, {from: accounts[0]});
    await instance.createStar('User2 Star!', User2Token, {from: accounts[1]});

    let err = null
    try {
        await instance.exchangeStars(User1Token, User2Token, {from: accounts[2]});
    } catch (error) {
        err = error
    }
    
    // Assert
    assert.ok(err instanceof Error)
});


it('lets a user transfer a star', async() => {
    // Arrange
    let tokenId = 11;
     let instance = await StarNotary.deployed();
        
    // Act
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    var createdStar = await instance.transferStar(accounts[1], tokenId, {from: accounts[0]});
    
    var user2Swap = await instance.ownerOf(tokenId);

    // Assert
    assert.notEqual(user2Swap, accounts[0]);
    assert.equal(user2Swap, accounts[1]);
    // 1. create a Star with different tokenId
    // 2. use the transferStar function implemented in the Smart Contract
    // 3. Verify the star owner changed.
});

it('lets a user transfer a star failed wrong owner', async() => {
    // Arrange
    let User1Token = 12;
    let instance = await StarNotary.deployed();

    // Act
    await instance.createStar('User1 Star!', User1Token, {from: accounts[0]});

    let err = null
    try {
        var createdStar = await instance.transferStar(accounts[1], tokenId, {from: accounts[1]});
    } catch (error) {
        err = error
    }
    
    // Assert
    assert.ok(err instanceof Error)
});


it('lookUptokenIdToStarInfo test', async() => {
    // Arrange 
    let tokenId = 13;
    let instance = await StarNotary.deployed();

    // Act
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    var getByTokenId = await instance.lookUptokenIdToStarInfo(tokenId); 

    // Assert
    assert.equal(await getByTokenId, 'Awesome Star!')
    // 2. Call your method lookUptokenIdToStarInfo
    // 3. Verify if you Star name is the same
});