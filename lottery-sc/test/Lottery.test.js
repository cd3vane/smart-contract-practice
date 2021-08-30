const assert = require('assert');
const Web3 = require('web3');
const ganache = require('ganache-cli');
const web3 = new Web3(ganache.provider());
const { interface, bytecode } = require('../compile');


let accounts;
let lottery;


beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ gas: '1000000', from: accounts[0] });
    //console.log(lottery)
})

describe('Lottery', () => {
    it('deploys a contract', () => {
        assert.ok(lottery.options.address);
    });
    it('has the correct manager', async () => {
        const manager = await lottery.methods.manager().call()
        assert.equal(accounts[0], manager);
    });
    it('allows a player to enter', async () => {
        await lottery.methods.enter().send({ 
            from: accounts[0],
            value: web3.utils.toWei('.02', 'ether')
        });
        const players =  await lottery.methods.getPlayers().call({
            from: accounts[0]
        });
        assert.equal(accounts[0], players[0]);
        assert.equal(1, players.length);
    });
    it('allows multiple players to enter', async () => {
        await lottery.methods.enter().send({ 
            from: accounts[0],
            value: web3.utils.toWei('.02', 'ether')
        });
        await lottery.methods.enter().send({ 
            from: accounts[1],
            value: web3.utils.toWei('.02', 'ether')
        });
        await lottery.methods.enter().send({ 
            from: accounts[2],
            value: web3.utils.toWei('.02', 'ether')
        });
        const players =  await lottery.methods.getPlayers().call({
            from: accounts[0]
        });
        assert.equal(accounts[0], players[0]);
        assert.equal(accounts[1], players[1]);
        assert.equal(accounts[2], players[2]);
        assert.equal(3, players.length);
    });
    // This is how you test that an error that should occur actually does occur given a certain condition
    it('requires a minimum amount of ether to enter', async () => {
        try{
            await lottery.methods.enter().send({ 
                from: accounts[0],
                value: web3.utils.toWei('.001', 'ether')
            });
            assert(false);
        } catch (err){
            assert(err);
        }
    });

    it('requires a manager to pick a winner', async () => {
        try{
            await lottery.methods.pickWinner().send({ 
                from: accounts[1]
            });
            assert(false);
        } catch (err){
            assert(err);
        }
    });

    it('sends the winner money and resets players array and lottery balance', async () =>{
        await lottery.methods.enter().send({ 
            from: accounts[0],
            value: web3.utils.toWei('2', 'ether')
        });

        const initialBalance = await web3.eth.getBalance(accounts[0]);
        await lottery.methods.pickWinner().send({ from: accounts[0] });
        const newBalance = await web3.eth.getBalance(accounts[0]);
        const difference = newBalance - initialBalance;

        assert(difference > web3.utils.toWei('1.8', 'ether'))

        const players =  await lottery.methods.getPlayers().call({
            from: accounts[0]
        });
        const lotteryBalance = await web3.eth.getBalance(lottery.options.address);
        assert(players.length == 0);
        assert(lotteryBalance == 0);
        
    })
});