const express = require("express");
const {
  createEntry,
  getEntries,
  getEntryById,
  updateEntry,
  deleteEntry,
} = require("../controllers/entryController");

const router = express.Router();

router.post("/", createEntry);
router.get("/", getEntries);
router.get("/:id", getEntryById);
router.get("/slug/:slug", async (req, res) => {
  const entry = await Entry.findOne({
    where: { slug: req.params.slug },
  });

  res.json(entry);
});
router.put("/:id", updateEntry);
router.delete("/:id", deleteEntry);

module.exports = router;