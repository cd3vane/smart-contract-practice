const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3'); // Web3 is capitalized because it is a constructor that creates instances of web3
const { interface, bytecode } = require('./compile');

const  provider = new HDWalletProvider(
    'deposit apple rhythm slow rug occur worth useless ski cabbage owner boost',
    'https://rinkeby.infura.io/v3/bb159c25733c45dbb95afef1a9185c23'
);

const web3 = new Web3(provider);

const deploy = async () =>{
    const accounts = await web3.eth.getAccounts();

    console.log('Attempting to deploy from ', accounts[0]);

    const result = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode, arguments: ['Hello World'] })
        .send({ gas: '10000000', from: accounts[0], gasPrice: '5000000000' });

    console.log('Contract deployed to', result.options.address);
};

deploy();