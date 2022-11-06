const chai = require("chai");
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const rewire = require("rewire");
const request = require("supertest");

var app = rewire("./app");

chai.use(chaiAsPromised);
chai.use(sinonChai);

const sandbox = sinon.createSandbox();

describe("app", () => {
  afterEach(() => {
    app = rewire("./app");
    sandbox.restore();
  });

  context("GET /", () => {
    it("should get /", (done) => {
      request(app)
        .get("/")
        .expect(200)
        .end((err, response) => {
          expect(response.body)
            .to.have.property("name")
            .to.equal("Foo Fooing Bar");
          done(err);
        });
    });
  });

  context("handleError", () => {
    let handleError, res, statusStub, jsonStub;

    beforeEach(() => {
      jsonStub = sandbox.stub().returns("done");
      statusStub = sandbox.stub().returns({
        json: jsonStub,
      });
      res = {
        status: statusStub,
      };

      handleError = app.__get__("handleError");
    });

    it("should check error instance and format message", (done) => {
      res = handleError(res, new Error("fake"));

      expect(statusStub).to.have.been.calledWith(400);
      expect(jsonStub).to.have.been.calledWith({
        error: "fake",
      });

      done();
    });

    it("should return an object without changing it", (done) => {
      const errorResponse = { id: "123", message: "fake error" };

      res = handleError(res, errorResponse);

      expect(statusStub).to.have.been.calledWith(400);
      expect(jsonStub).to.have.been.calledWith(errorResponse);

      done();
    });
  });
});
