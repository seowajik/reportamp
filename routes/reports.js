const express = require("express");
const router = express.Router();
const { Report, Brand, Url } = require("../models");

// List all reports
router.get("/", async (req, res) => {
  try {
    const reports = await Report.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Brand,
          include: [Url],
        },
      ],
    });

    res.render("reports", { reports });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).send("Error fetching reports");
  }
});

// View specific report
router.get("/:id", async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id, {
      include: [
        {
          model: Brand,
          include: [Url],
        },
      ],
    });

    if (!report) {
      return res.status(404).send("Report not found");
    }

    res.render("report-detail", { report });
  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).send("Error fetching report");
  }
});

module.exports = router;
