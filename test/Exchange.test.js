import { tokens, EVM_REVERT } from './helpers'

const Exchange = artifacts.require('./Exchange')
const Token = artifacts.require('./Token')

require('chai')
    .use(require('chai-as-promised'))
    .should()



contract('Exchange', ([deployer, feeAccount, user1]) => {
    let exchange
    let token
    const feePercent = 10

    beforeEach(async () => {
        // Deploy token
        token = await Token.new()
        // Transfer some toekns to user1
        exchange = await Exchange.new(feeAccount, feePercent)
        // Deploy exchange
        token.transfer(user1, tokens(100), { from: deployer })
    })
    describe('deployment', () => {
        it('tracks the fee account', async () => {
            const result = await exchange.feeAccount()
            result.should.equal(feeAccount)
        })

        it('tracks the fee percent', async () => {
            const result = await exchange.feePercent()
            result.toString().should.equal(feePercent.toString())
        })
    })

    describe('depositing tokens', () => {
        let result
        let amount
        beforeEach(async () => {
            amount = tokens(10)
            await token.approve(exchange.address, amount, { from: user1 })
            result = await exchange.depositToken(token.address, tokens(10), { from: user1 })
        })
        describe('success', () => {
            it('tracks the token deposit', async () => {
                let balance = await token.balanceOf(exchange.address)
                balance.toString().should.equal(tokens(10).toString())
            })

        })

        describe('failure', () => {
            
        })
    })

    

})