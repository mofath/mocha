const chai = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const chaiAsPromised = require("chai-as-promised");
const demo = require("./demo");

const expect = chai.expect;
chai.use(chaiAsPromised);
chai.use(sinonChai);

describe("demo", () => {
  context("add", () => {
    it("should add two numbers", () => {
      expect(demo.add(2, 3)).to.equal(5);
    });
  });

  context("callback add", () => {
    it("should test the callback", (done) => {
      demo.addCallback(1, 2, (err, result) => {
        expect(err).to.not.exist;
        expect(result).to.equal(3);
        done();
      });
    });
  });

  context("test promise", () => {
    it("should test promise with cb", (done) => {
      demo
        .addPromise(1, 2)
        .then((result) => {
          expect(result).to.equal(3);
          done();
        })
        .catch((err) => {
          done(new Error(err));
        });
    });

    it("should test promise with return", () => {
      return demo.addPromise(1, 2).then((result) => {
        expect(result).to.equal(3);
      });
    });

    it("should test a promise with return", () => {
      return demo.addPromise(1, 2).then((result) => {
        expect(result).to.equal(3);
      });
    });

    it("should test promise with async/await", async () => {
      let result = await demo.addPromise(1, 2);
      expect(result).to.equal(3);
    });

    it("should test promise with chaiAsPromised", async () => {
      await expect(demo.addPromise(1, 2)).to.eventually.equal(3);
    });
  });

  context("test doubles", () => {
    it("should spy on log", () => {
      let spy = sinon.spy(console, "log");

      demo.foo();
      expect(spy.calledOnce).to.be.true;
      expect(spy).to.have.been.calledOnce;

      spy.restore();
    });
  });
});
