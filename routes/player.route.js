const player = require("../controllers/player.controller");

const router = require("express").Router();

router.route("/").post(player.create);

module.exports = router;
