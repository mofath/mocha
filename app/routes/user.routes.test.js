const chai = require("chai");
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const rewire = require("rewire");
const request = require("supertest");

var app = rewire("../app");
var utils = rewire("../lib/utils");
var users = require("../services/users");
var auth = require("../services/auth");

chai.use(chaiAsPromised);
chai.use(sinonChai);

const sandbox = sinon.createSandbox();

describe("user routes", () => {
  afterEach(() => {
    utils = rewire("../lib/utils");
    app = rewire("../app");
    sandbox.restore();
  });

  context("POST /user", () => {
    let createStub, errorStub;
    const sampleUser = { name: "fake" };

    it("it should call user.create", (done) => {
      createStub = sandbox.stub(users, "create").resolves(sampleUser);

      request(app)
        .post("/user")
        .send(sampleUser)
        .expect(200)
        .end((err, response) => {
          expect(createStub).to.have.been.calledOnce;
          expect(response.body)
            .to.have.property("name")
            .to.equal(sampleUser.name);
          done(err);
        });
    });

    it("should call handleError on error", (done) => {
      createStub = sandbox
        .stub(users, "create")
        .rejects(new Error("fake_error"));

      const fakeErrorResponse = (response, error) => {
        return response.status(400).json({ error: "Invalid" });
      };

      errorStub = sandbox
        .stub(utils, "handleError")
        .callsFake(fakeErrorResponse);

      request(app)
        .post("/user")
        .send()
        .expect(400)
        .end((error, response) => {
          expect(createStub).to.have.been.calledOnce;
          // expect(errorStub).to.have.been.calledOnce;
          // expect(response.body).to.have.property("error").to.equal("Invalid");
          done(error);
        });
    });
  });

  //   context("DELETE /user/:id", () => {
  //     let authStub, deleteStub;

  //     beforeEach(() => {
  //       fakeAuth = (req, res, next) => {
  //         return next();
  //       };

  //       authStub = sandbox.stub(auth, "isAuthorized").callsFake(fakeAuth);

  //       utils = rewire("../lib/utils");
  //       app = rewire("../app");
  //     });

  //     it("should call auth check function and users.delete on success", (done) => {
  //       deleteStub = sandbox.stub(users, "delete").resolves("fake_delete");
  //       request(app)
  //         .delete("/user/123")
  //         .expect(200)
  //         .end((err, response) => {
  //           expect(authStub).to.have.been.calledOnce;
  //           expect(deleteStub).to.have.been.calledWithMatch({ id: "123" });
  //           expect(response.body).to.equal("fake_delete");
  //           done(err);
  //         });
  //     });

  //     it("should call handleError on error", (done) => {
  //       createStub = sandbox
  //         .stub(users, "delete")
  //         .rejects(new Error("fake_error"));

  //       const fakeErrorResponse = (response, error) => {
  //         return response.status(400).json({ error: "Invalid" });
  //       };

  //       errorStub = sandbox.stub(utils, "handleError").callsFake(fakeErrorResponse);

  //       request(app)
  //         .delete("/user/123")
  //         .send()
  //         .expect(400)
  //         .end((error, response) => {
  //           expect(createStub).to.have.been.calledOnce;
  //           expect(errorStub).to.have.been.calledOnce;
  //           expect(response.body).to.have.property("error").to.equal("Invalid");
  //           done(error);
  //         });
  //     });
  //   });
});
