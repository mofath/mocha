const chai = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const chaiAsPromised = require("chai-as-promised");
const rewire = require("rewire");
const mongoose = require("mongoose");
const mailer = require("./mailer");

let users = rewire("./users");

chai.use(sinonChai);
chai.use(chaiAsPromised);

const expect = chai.expect;
const sandbox = sinon.createSandbox();

describe("Users service", () => {
  let findStub;
  let deleteStub;
  let mailerStub;
  let sampleArgs;
  let sampleUser;

  beforeEach(() => {
    sampleUser = {
      id: "123",
      name: "foo",
      email: "foo@bar.com",
      save: sandbox.stub().resolves(),
    };

    findStub = sandbox.stub(mongoose.Model, "findById").resolves(sampleUser);
    deleteStub = sandbox
      .stub(mongoose.Model, "remove")
      .resolves("removed_sample_user");
    mailerStub = sandbox
      .stub(mailer, "sendWelcomeEmail")
      .resolves("fake_welcome_user");
  });

  afterEach(() => {
    sandbox.restore();
    // this resets any changes rewire has done
    users = rewire("./users");
  });

  context("find user", () => {
    it("it should check for an ID", (done) => {
      users.get(null, (err, result) => {
        expect(err).to.exist;
        expect(err.message).to.equal("Invalid user id");
        done();
      });
    });

    it("should call findUserById with id and return result", (done) => {
      sandbox.restore();

      let stub = sandbox
        .stub(mongoose.Model, "findById")
        .yields(null, { name: "bar" });

      users.get("123", (err, result) => {
        expect(err).to.not.exist;
        expect(stub).to.have.been.calledOnce;
        expect(stub).to.have.been.calledWith("123");
        expect(result).to.be.a("object");
        expect(result).to.have.property("name").to.equal("bar");
        done();
      });
    });

    it("it catch error when there is one", (done) => {
      sandbox.restore();
      let stub = sandbox
        .stub(mongoose.Model, "findById")
        .yields(new Error("invalid"));

      users.get("123", (err, result) => {
        expect(result).to.not.exist;
        expect(stub).to.have.been.calledOnce;
        expect(stub).to.have.been.calledWith("123");
        expect(err).to.exist;
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.equal("invalid");
        done();
      });
    });
  });

  context("delete user", () => {
    it("should check for an id using return", () => {
      return users
        .delete()
        .then((result) => {
          throw new Error("unexpected success");
        })
        .catch((ex) => {
          expect(ex).to.be.instanceof(Error);
          expect(ex.message).to.equal("Invalid id");
        });
    });

    it("should check for error using eventually", () => {
      return expect(users.delete()).to.eventually.be.rejectedWith("Invalid id");
    });

    it("should call User.remove", async () => {
      let result = await users.delete(123);

      expect(result).to.equal("removed_sample_user");
      expect(deleteStub).to.have.been.calledWith({ _id: 123 });
    });
  });

  context("create user", () => {
    let FakeUserClass, saveStub, result;

    beforeEach(async () => {
      saveStub = sandbox.stub().resolves(sampleUser);
      FakeUserClass = sandbox.stub().returns({ save: saveStub });

      users.__set__("UserModel", FakeUserClass);
      result = await users.create(sampleUser);
    });

    it("should reject invalid args", async () => {
      await expect(users.create()).to.eventually.be.rejectedWith(
        "Invalid arguments"
      );
      await expect(users.create({ name: "foo" })).to.eventually.be.rejectedWith(
        "Invalid arguments"
      );
      await expect(
        users.create({ email: "foo@bar.com" })
      ).to.eventually.be.rejectedWith("Invalid arguments");
    });

    it("should call User with new", () => {
      expect(FakeUserClass).to.have.been.calledWithNew;
      expect(FakeUserClass).to.have.been.calledWith(sampleUser);
    });

    it("should save the user", () => {
      expect(saveStub).to.have.been.called;
    });

    it("should call mailer with email and name", () => {
      expect(mailerStub).to.have.been.calledWith(
        sampleUser.email,
        sampleUser.name
      );
    });

    it("should reject errors", async () => {
      saveStub.rejects(new Error("fake"));

      await expect(users.create(sampleUser)).to.eventually.be.rejectedWith(
        "fake"
      );
    });
  });

  context("update user", () => {
    it("should find user by id", async () => {
      await users.update("123", { age: 23 });
      expect(findStub).to.have.been.calledWith("123");
    });

    it("should call user.save", async () => {
      await users.update("123", { age: 23 });
      expect(sampleUser.save).to.have.been.calledOnce;
    });

    it("should reject with an error", async () => {
      findStub.throws(new Error("invalid"));

      await expect(users.update()).to.eventually.be.rejectedWith("invalid");
    });
  });

  context("reset password", () => {
    let resetEmailStub;

    beforeEach(() => {
      resetEmailStub = sandbox
        .stub(mailer, "sendPasswordResetEmail")
        .resolves("reset");
    });

    it("should check for email", async () => {
      await expect(users.resetPassword()).to.eventually.be.rejectedWith(
        "Invalid email"
      );
    });

    it("should call mailer.sendPasswordResetEmail", async () => {
      await users.resetPassword(sampleUser.email);

      expect(resetEmailStub).to.have.been.calledWith(sampleUser.email);
    });
  });
});
