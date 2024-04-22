const game = require("../controllers/game.controller.js");
const router = require("express").Router();

router.route("/").post(game.create);
router.route("/:id/join").post(game.join);
router.route("/:id/move").post(game.play);
router.route("/:id/ready").post(game.ready);

module.exports = router;
