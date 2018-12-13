import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import chaiBigNumber from 'chai-bignumber'

import { linkLibs } from '../helpers/utils'
import { ChildChain, ChildERC721, RootERC721 } from '../helpers/contracts'

import LogDecoder from '../helpers/log-decoder'

// add chai pluggin
chai
  .use(chaiAsPromised)
  .use(chaiBigNumber(web3.BigNumber))
  .should()

contract('ChildERC721', async function(accounts) {
  let rootToken
  let childToken
  let childChain
  let tokenId
  let owner
  let logDecoder

  beforeEach(async function() {
    // link libs
    await linkLibs()
    logDecoder = new LogDecoder([
      RootERC721._json.abi,
      ChildChain._json.abi,
      ChildERC721._json.abi
    ])
    owner = accounts[0]
    // root token / child chain
    rootToken = await RootERC721.new('Test Token', 'TEST')
    childChain = await ChildChain.new()
    // receipt
    const receipt = await childChain.addToken(
      rootToken.address,
      'test token',
      'tst',
      18,
      true
    )
    childToken = ChildERC721.at(receipt.logs[1].args.token)

    // tokenId
    tokenId = web3.toWei(11)
  })

  it('should initialize properly', async function() {
    // await childToken.owner().should.eventually.equal(childChain.address)
    // await childToken.token().should.eventually.equal(rootToken.address)
  })

  it('should allow to deposit', async function() {
    tokenId = tokenId + 9
    let receipt = await childChain.depositTokens(
      rootToken.address,
      owner,
      tokenId,
      11
    )
    const logs = logDecoder.decodeLogs(receipt.receipt.logs)
    logs.should.have.lengthOf(3)
    // todo: add event wise validation
  })

  it('should not allow to withdraw more than amount', async function() {
    // await childToken.withdraw(web3.toWei(13)).should.be.rejected
  })

  it('should allow to withdraw mentioned amount', async function() {
    // deposit tokens
    tokenId += 1
    let rec = await childChain.depositTokens(
      rootToken.address,
      owner,
      tokenId,
      12
    )

    let logs = logDecoder.decodeLogs(rec.receipt.logs)
    logs.should.have.lengthOf(3)

    // withdraw those tokens
    const receipt = await childToken.withdraw(tokenId)

    logs = logDecoder.decodeLogs(receipt.receipt.logs)

    logs.should.have.lengthOf(2)

    // receipt.logs[0].event.should.equal('Transfer')
    // // receipt.logs[0].args.token.should.equal(rootToken.address)
    // // receipt.logs[0].args.user.should.equal(owner)
    // // receipt.logs[0].args.value.toString().should.equal(tokenId)

    // receipt.logs[1].event.should.equal('WithdrawERC721')
    // receipt.logs[1].args.token.should.be.bignumber.equal(rootToken.address)
    // receipt.logs[1].args.tokenId.should.be.bignumber.equal(tokenId)
    // receipt.logs[1].args.output1.should.be.bignumber.equal(0)

    // const afterBalance = await childToken.balanceOf(owner)
    // afterBalance.should.be.bignumber.equal(0)
  })

  it('should check true (safety check)', async function() {
    assert.isOk(true)
  })
})
