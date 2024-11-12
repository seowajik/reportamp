const express = require("express");
const router = express.Router();
const { sequelize, Report, Brand, Url } = require("../models");
const reportService = require("../services/reportService");
const telegramService = require("../services/telegramService");

// Route untuk menampilkan form
router.get("/", (req, res) => {
  res.render("form");
});

// Route untuk generate report
router.post("/generate-report", async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { owner, brands, attention, updates } = req.body;

    // Validasi data
    if (!owner || !Array.isArray(brands) || brands.length === 0) {
      throw new Error("Invalid input data");
    }

    // Create report
    const report = await Report.create(
      {
        owner,
        attention,
        updates,
      },
      { transaction }
    );

    // Create brands and URLs
    for (const brandData of brands) {
      if (!brandData.name || !Array.isArray(brandData.urls)) {
        continue;
      }

      const brand = await Brand.create(
        {
          name: brandData.name,
          owner,
          ReportId: report.id,
        },
        { transaction }
      );

      for (const urlData of brandData.urls) {
        if (!urlData.url) continue;

        await Url.create(
          {
            url: urlData.url,
            rank: urlData.rank,
            ampStatus: urlData.ampStatus,
            BrandId: brand.id,
          },
          { transaction }
        );
      }
    }

    // Generate and send telegram message
    const reportMessage = reportService.generateReportMessage({
      owner,
      brands,
      attention,
      updates,
    });

    const sentMessage = await telegramService.sendReport(reportMessage);

    // Save telegram message ID
    if (sentMessage && sentMessage.message_id) {
      report.messageId = sentMessage.message_id;
      await report.save({ transaction });
    }

    await transaction.commit();
    res.json({ success: true, reportId: report.id });
  } catch (error) {
    await transaction.rollback();
    console.error("Error generating report:", error);
    res.status(500).json({
      success: false,
      error: error.message || "An error occurred while generating the report",
    });
  }
});

module.exports = router;
