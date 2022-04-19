import { tokens, ether, EVM_REVERT, ETHER_ADDRESS } from './helpers'

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

    describe('fallback', () => {
        it('reverts when Ether is sent', async () => {
            await exchange.sendTransaction({ value: 1, from: user1 }).should.be.rejectedWith(EVM_REVERT)
        })
    })

    describe('depositing Ether', () => {
        let result
        let amount

        beforeEach(async () => {
        amount = ether(1)
            result = await exchange.depositEther({ from: user1, value: amount })
        })

        it('tracks the Ether deposit', async () => {
            const balance = await exchange.tokens(ETHER_ADDRESS, user1);
            balance.toString().should.equal(amount.toString())
        })

        it('emits a Deposit event', async () => {
            const log = result.logs[0]
            log.event.should.equal('Deposit')
            const event = log.args
            event.token.should.equal(ETHER_ADDRESS, 'token address is correct')
            event.user.should.equal(user1, 'user address is correct')
            event.amount.toString().should.equal(amount.toString(), 'amount is correct')
            event.balance.toString().should.equal(amount.toString(), 'balance is correct')
        });
    })

    describe('withdrawing Ether', () => {
        let result
        let amount

        beforeEach(async () => {
            amount = ether(1)
            await exchange.depositEther({ from: user1, value: amount })
        })

        describe('success', () => {
            beforeEach(async () => {
                result = await exchange.withdrawEther(amount, { from: user1 })
            })

            it('withdraws Ether funds', async () => {
                const balance = await exchange.tokens(ETHER_ADDRESS, user1);
                balance.toString().should.equal('0')
            })

            it('emits a Withdraw event', async () => {
                const log = result.logs[0]
                log.event.should.equal('Withdraw')
                const event = log.args
                event.token.should.equal(ETHER_ADDRESS, 'token address is correct')
                event.user.should.equal(user1, 'user address is correct')
                event.amount.toString().should.equal(amount.toString(), 'amount is correct')
                event.balance.toString().should.equal('0', 'balance is correct')
            });
        })

        describe('failure', () => {
            it('rejects withdrawal for insufficient balances', async () => {
                 
            })
        })
    })

    describe('depositing tokens', () => {
        let result
        let amount

        describe('success', () => {
            beforeEach(async () => {
                amount = tokens(10)
                await token.approve(exchange.address, amount, { from: user1 })
                result = await exchange.depositToken(token.address, tokens(10), { from: user1 })
            })

            it('tracks the token deposit', async () => {
                // Check exchange token balance
                let balance = await token.balanceOf(exchange.address)
                balance.toString().should.equal(tokens(10).toString())
                // Check toekns on exchange
                balance = await exchange.tokens(token.address, user1)
                balance.toString().should.equal(amount.toString())
            })

            it('emits a Deposit event', async () => {
                const log = result.logs[0]
                log.event.should.equal('Deposit')
                const event = log.args
                event.token.should.equal(token.address, 'token address is correct')
                event.user.should.equal(user1, 'user address is correct')
                event.amount.toString().should.equal(amount.toString(), 'amount is correct')
                event.balance.toString().should.equal(amount.toString(), 'balance is correct')
            });

        })

        describe('failure', () => {
            it('rejects Ether deposits', async () => {
                await exchange.depositToken(ETHER_ADDRESS, tokens(10), { from: user1 }).should.be.rejectedWith(EVM_REVERT);

            })
            it('fails when no tokens are approved', async () => {
                await exchange.depositToken(token.address, tokens(10), { from: user1 }).should.be.rejectedWith(EVM_REVERT)

            })
        })
    })

    describe('withdrawing tokens', () => {
        let result
        let amount

        describe('success', () => {
            beforeEach(async () => {
                // Deposit tokens
                amount = tokens(10)
                await token.approve(exchange.address, amount, { from: user1 })
                await exchange.depositToken(token.address, amount, { from: user1 })

                // Withdraw tokens
                result = await exchange.withdrawToken(token.address, amount, { from: user1 })
            })

            it('withdraws token funds', async () => {
                // Check exchange token balance
                let balance = await exchange.tokens(token.address, user1)
                balance.toString().should.equal('0')
                // Check toekns on exchange
            })

            it('emits a Deposit event', async () => {
                const log = result.logs[0]
                log.event.should.equal('Withdraw')
                const event = log.args
                event.token.should.equal(token.address, 'token address is correct')
                event.user.should.equal(user1, 'user address is correct')
                event.amount.toString().should.equal(amount.toString(), 'amount is correct')
                event.balance.toString().should.equal('0', 'balance is correct')
            });

        })

        describe('failure', () => {
            it('rejects Ether withdrawals', async () => {
                await exchange.withdrawToken(ETHER_ADDRESS, tokens(10), { from: user1 }).should.be.rejectedWith(EVM_REVERT);
            })
                
            it('fails for insufficient balance', async () => {
                await exchange.withdrawToken(token.address, tokens(10), { from: user1 }).should.be.rejectedWith(EVM_REVERT);
            })
        })

        describe('checking balances', () => {
            beforeEach(async () => {
                await exchange.depositEther({ from: user1, value: ether(1)})
            })

            it('returns user balance', async () => {
                const result = await exchange.balanceOf(ETHER_ADDRESS, user1)
                result.toString().should.equal(ether(1).toString())
            })
        })
    })    

})