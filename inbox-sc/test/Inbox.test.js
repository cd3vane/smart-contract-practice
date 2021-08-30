const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3'); // Web3 is capitalized because it is a constructor that creates instances of web3
const web3 = new Web3(ganache.provider()); //Web3 needs a provider to know which network to communicate with
const { interface, bytecode } = require('../compile');


let accounts;
let inbox;
const INITIAL_STIRNG = 'Hello World'

beforeEach(async () => {
    // Get a list of all accounts
    accounts = await web3.eth.getAccounts()
    // Use one of those accounts to deploy the contract
    inbox = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode, arguments: [INITIAL_STIRNG] })
        .send({from: accounts[0], gas: '1000000' });
});

describe('Inbox', () => {
    it('deploys a contract', () => {
        assert.ok(inbox.options.address);
    });
    
    it('has a default message', async () => {
        const message = await inbox.methods.message().call();
        assert.equal(message, INITIAL_STIRNG);
    });
    
    it('sets a new message', async () => {
        await inbox.methods.setMessage('Hi There').send({from: accounts[0] });
        const message = await inbox.methods.message().call();
        assert.equal(message, 'Hi There');
    });
});