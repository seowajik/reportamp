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
    console.log("Received data:", JSON.stringify(req.body, null, 2));

    // Validate input
    const validation = reportService.validateReportData(req.body);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(", "));
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
      const brand = await Brand.create(
        {
          name: brandData.name,
          owner,
          ReportId: report.id,
        },
        { transaction }
      );

      for (const urlData of brandData.urls) {
        const urlToCreate = {
          url: urlData.url,
          rank: urlData.rank,
          ampStatus: urlData.ampStatus,
          BrandId: brand.id,
        };

        // Add ampUrl if it exists and AMP is active
        if (urlData.ampStatus && urlData.ampUrl) {
          urlToCreate.ampUrl = urlData.ampUrl;
        }

        console.log("Creating URL:", urlToCreate);
        await Url.create(urlToCreate, { transaction });
      }
    }

    // Generate and send Telegram message
    try {
      // Generate telegram message
      const messageData = {
        owner,
        brands,
        attention,
        updates,
      };

      console.log("Generating Telegram message with data:", messageData);
      const telegramMessage = reportService.generateReportMessage(messageData);

      // Send to telegram
      console.log("Sending to Telegram:", telegramMessage);
      const sentMessage = await telegramService.sendMessage(telegramMessage);

      if (sentMessage && sentMessage.message_id) {
        report.messageId = sentMessage.message_id;
        await report.save({ transaction });
      }

      console.log("Telegram message sent successfully");
    } catch (telegramError) {
      console.error("Telegram Error:", telegramError);
      // Don't throw error, continue with transaction
    }

    await transaction.commit();
    console.log("Report created successfully:", report.id);

    res.json({
      success: true,
      reportId: report.id,
      message: "Report generated and sent to Telegram successfully",
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error generating report:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Error generating report",
    });
  }
});

module.exports = router;
