const express = require("express");
const router = express.Router();
const users = require("../services/users");
const auth = require("../services/auth");
const utils = require("../lib/utils");

router.get("/:id", function (req, res) {
  users.get(req.params.id, function (err, result) {
    if (err) {
      return utils.handleError(res, err);
    }

    res.json(result);
  });
});

router.post("/", async (req, res) => {
  try {
    const result = await users.create(req.body);
    res.json(result);
  } catch (error) {
    utils.handleError(res, err);
  }
});

router.put("/:id", function (req, res) {
  users
    .update(req.params.id, req.body)
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      handleError(res, err);
    });
});

router.delete("/:id", auth.isAuthorized, async (req, res) => {
  try {
    const result = await users.delete({ id: req.params.id, name: "foo" });
    res.json(result);
  } catch (error) {
    utils.handleError(res, err);
  }
});

router.get("/reset/:email", function (req, res) {
  users
    .resetPassword(req.params.email)
    .then((result) => {
      res.json({
        message: "Password reset email has been sent.",
      });
    })
    .catch((err) => {
      handleError(res, err);
    });
});

module.exports = router;
