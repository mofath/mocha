const chai = require("chai");
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const rewire = require("rewire");

const sandbox = sinon.createSandbox();

chai.use(sinonChai);
chai.use(chaiAsPromised);

let mailer = rewire("./mailer");

describe("", () => {
  const name = "foo";
  const email = "foo@bar.com";
  let mailerStub;

  beforeEach(() => {
    mailerStub = sandbox.stub().resolves("fake_email_sent");
    mailer.__set__("sendEmail", mailerStub);
  });

  afterEach(() => {
    sandbox.restore();
    mailer = rewire("./mailer");
  });

  context("send welcome email", () => {
    it("should check for email and password", async () => {
      await expect(mailer.sendWelcomeEmail()).to.eventually.be.rejectedWith(
        "Invalid input"
      );
      await expect(
        mailer.sendWelcomeEmail(email)
      ).to.eventually.be.rejectedWith("Invalid input");
    });

    it("should call sendEmail with email and message", async () => {
      await mailer.sendWelcomeEmail(email, name);
      expect(mailerStub).to.have.been.calledWith(
        email,
        `Dear ${name}, welcome to our family!`
      );
    });
  });

  context("send password reset email", () => {
    it("should check for email", async () => {
      await expect(mailer.sendWelcomeEmail()).to.eventually.be.rejectedWith(
        "Invalid input"
      );
    });

    it("should call sendEmail with email and message", async () => {
      await mailer.sendPasswordResetEmail(email);
      expect(mailerStub).to.have.been.calledWith(
        email,
        "Please click http://some_link to reset your password."
      );
    });
  });

  context("send email", () => {
    let sendEmail;

    beforeEach(() => {
      mailer = rewire("./mailer");
      sendEmail = mailer.__get__("sendEmail");
    });

    it("should check for email and body", async () => {
      await expect(sendEmail()).to.eventually.be.rejectedWith("Invalid input");
      await expect(sendEmail(email)).to.eventually.be.rejectedWith(
        "Invalid input"
      );
    });

    it("should call sendEmail with email and message", async () => {
      const result = await sendEmail(email, "msg");
      expect(result).to.equal("Email sent");
    });
  });
});
