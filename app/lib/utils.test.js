const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const chaiAsPromised = require("chai-as-promised");
var crypto = require("crypto");
var config = require("../config/config");
var utils = require("./utils");

chai.use(chaiAsPromised);
chai.use(sinonChai);

const sandbox = sinon.createSandbox();

describe("utils", () => {
  let secretStub, digestStub, updateStub, createHashStub, hash;

  const fakeSecret = "fake_secret";
  const stringToBeHashed = "foo";

  beforeEach(() => {
    secretStub = sandbox.stub(config, "secret").returns(fakeSecret);
    digestStub = sandbox.stub().returns("ABC123");
    updateStub = sandbox.stub().returns({ digest: digestStub });
    createHashStub = sandbox.stub(crypto, 'createHash').returns({ update: updateStub });

    hash = utils.getHash(stringToBeHashed);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should return null if invalid string is passed", () => {
    let hash2 = utils.getHash(null);
    let hash3 = utils.getHash(123);
    let hash4 = utils.getHash({});

    expect(hash2).to.be.null;
    expect(hash3).to.be.null;
    expect(hash4).to.be.null;
  });

  it("should get secret from config", () => {
    expect(secretStub).to.have.been.called;
  });

  it("should call ceypto with correct settings and return hash", () => {
    expect(createHashStub).to.have.been.calledWith("md5");
    expect(updateStub).to.have.been.calledWith(`${stringToBeHashed}_${fakeSecret}`);
    expect(digestStub).to.have.been.calledWith("hex");
    expect(hash).to.equal("ABC123");
  });
});
