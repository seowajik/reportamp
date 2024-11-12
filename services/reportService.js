const moment = require("moment");
const { Report, Brand, Url } = require("../models");

class ReportService {
  /**
   * Generate formatted message for Telegram
   * @param {Object} data Report data
   * @returns {String} Formatted message
   */
  generateReportMessage(data) {
    try {
      console.log(
        "Generating report message with data:",
        JSON.stringify(data, null, 2)
      );

      const { owner, brands, attention, updates } = data;
      const date = moment().format("DD/MM/YYYY");
      const time = moment().format("HH:mm");

      let message = this.generateHeader(date, time, owner);
      message += this.generateBrandsSection(brands);
      message += this.generateFooter(attention, updates);

      console.log("Generated message:", message);
      return message;
    } catch (error) {
      console.error("Error generating report message:", error);
      throw error;
    }
  }

  /**
   * Generate report header
   * @param {String} date Current date
   * @param {String} time Current time
   * @param {String} owner Owner name
   * @returns {String} Formatted header
   */
  generateHeader(date, time, owner) {
    const jakartaTime = moment().tz("Asia/Jakarta");
    const formattedDate = jakartaTime.format("DD/MM/YYYY");
    const formattedTime = jakartaTime.format("hh:mm A");

    let header = "";
    header += `📊 *LAPORAN RANKING DOMAIN & STATUS AMP*\n`;
    header += `📅 Periode: ${formattedDate}\n`;
    header += `⏰ Time Check: ${formattedTime} WIB\n`;
    header += `👤 Owner: *${owner}*\n\n`;
    header += `🏆 *RANKING SERP*\n\n`;
    return header;
  }

  /**
   * Generate brands section of the report
   * @param {Array} brands Array of brand data
   * @returns {String} Formatted brands section
   */
  generateBrandsSection(brands) {
    let brandsSection = "";

    if (Array.isArray(brands)) {
      brands.forEach((brand, index) => {
        brandsSection += this.generateBrandEntry(brand, index);
      });
    }

    return brandsSection;
  }

  /**
   * Generate single brand entry
   * @param {Object} brand Brand data
   * @param {Number} index Brand index
   * @returns {String} Formatted brand entry
   */
  generateBrandEntry(brand, index) {
    let brandEntry = `*${brand.name.toUpperCase()}*\n`;
    brandEntry += `━━━━━━━━━━━━━━\n`;

    if (Array.isArray(brand.urls)) {
      brand.urls.forEach((url, urlIndex) => {
        brandEntry += this.generateUrlEntry(url, urlIndex + 1);
      });
    }

    brandEntry += "\n"; // Tambah baris kosong antara brand
    return brandEntry;
  }

  /**
   * Generate URL entry
   * @param {Object} url URL data
   * @returns {String} Formatted URL entry
   */
  generateUrlEntry(url, urlIndex) {
    const ampStatus = url.ampStatus ? "✅ AKTIF" : "❌ TIDAK AKTIF";
    let urlEntry = "";
    urlEntry += `🔗 *URL ${urlIndex}:*\n`;
    urlEntry += `${url.url}\n`;
    urlEntry += `📊 Rank: *${url.rank}*\n`;
    urlEntry += `⚡ AMP: *${ampStatus}*\n\n`;
    return urlEntry;
  }

  /**
   * Generate report footer
   * @param {String} attention Attention message
   * @param {String} updates Updates message
   * @returns {String} Formatted footer
   */
  generateFooter(attention, updates) {
    let footer = "";
    footer += `━━━━━━━━━━━━━━\n`;
    footer += `📝 *CATATAN:*\n`;
    footer += `• ✅ = AMP aktif\n`;
    footer += `• ❌ = AMP tidak aktif\n`;
    footer += `• [-] = Tidak terindex\n\n`;

    if (attention) {
      footer += `⚠️ *PERHATIAN:*\n`;
      footer += `${attention}\n\n`;
    }

    if (updates) {
      footer += `🔄 *UPDATE:*\n`;
      footer += `${updates}\n\n`;
    }

    footer += `━━━━━━━━━━━━━━\n`;
    footer += `🤖 Generated by Report Bot Fiki`;

    return footer;
  }

  /**
   * Get report by ID with all related data
   * @param {Number} reportId Report ID
   * @returns {Promise} Report data
   */
  async getReportById(reportId) {
    try {
      return await Report.findByPk(reportId, {
        include: [
          {
            model: Brand,
            include: [Url],
          },
        ],
        order: [
          [Brand, "id", "ASC"],
          [Brand, Url, "id", "ASC"],
        ],
      });
    } catch (error) {
      console.error("Error fetching report:", error);
      throw error;
    }
  }

  /**
   * Get all reports with basic information
   * @returns {Promise} Array of reports
   */
  async getAllReports() {
    try {
      return await Report.findAll({
        include: [
          {
            model: Brand,
            include: [Url],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
    } catch (error) {
      console.error("Error fetching reports:", error);
      throw error;
    }
  }

  /**
   * Format report data for display
   * @param {Object} report Report data from database
   * @returns {Object} Formatted report data
   */
  formatReportForDisplay(report) {
    return {
      id: report.id,
      owner: report.owner,
      date: moment(report.createdAt).format("DD/MM/YYYY HH:mm"),
      brandsCount: report.Brands ? report.Brands.length : 0,
      urlsCount: report.Brands
        ? report.Brands.reduce(
            (sum, brand) => sum + (brand.Urls ? brand.Urls.length : 0),
            0
          )
        : 0,
      attention: report.attention,
      updates: report.updates,
    };
  }

  /**
   * Validate report data
   * @param {Object} data Report data to validate
   * @returns {Object} Validation result
   */
  validateReportData(data) {
    const errors = [];

    if (!data.owner) {
      errors.push("Owner name is required");
    }

    if (!Array.isArray(data.brands) || data.brands.length === 0) {
      errors.push("At least one brand is required");
    } else {
      data.brands.forEach((brand, index) => {
        if (!brand.name) {
          errors.push(`Brand name is required for brand #${index + 1}`);
        }
        if (!Array.isArray(brand.urls) || brand.urls.length === 0) {
          errors.push(
            `At least one URL is required for brand ${
              brand.name || `#${index + 1}`
            }`
          );
        } else {
          brand.urls.forEach((url, urlIndex) => {
            if (!url.url) {
              errors.push(
                `URL is required for ${
                  brand.name || `brand #${index + 1}`
                }, URL #${urlIndex + 1}`
              );
            }
            if (!url.rank) {
              errors.push(
                `Rank is required for ${url.url || `URL #${urlIndex + 1}`} in ${
                  brand.name || `brand #${index + 1}`
                }`
              );
            }
          });
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate report statistics
   * @param {Object} report Report data
   * @returns {Object} Report statistics
   */
  generateReportStats(report) {
    const stats = {
      totalBrands: 0,
      totalUrls: 0,
      ampActiveCount: 0,
      ampInactiveCount: 0,
      averageRank: 0,
      rankDistribution: {},
    };

    if (report.Brands) {
      stats.totalBrands = report.Brands.length;

      report.Brands.forEach((brand) => {
        if (brand.Urls) {
          stats.totalUrls += brand.Urls.length;

          brand.Urls.forEach((url) => {
            // Count AMP status
            if (url.ampStatus) {
              stats.ampActiveCount++;
            } else {
              stats.ampInactiveCount++;
            }

            // Calculate rank distribution
            const rank = parseInt(url.rank);
            if (!isNaN(rank)) {
              stats.averageRank += rank;
              stats.rankDistribution[rank] =
                (stats.rankDistribution[rank] || 0) + 1;
            }
          });
        }
      });

      if (stats.totalUrls > 0) {
        stats.averageRank = (stats.averageRank / stats.totalUrls).toFixed(2);
      }
    }

    return stats;
  }
}

module.exports = new ReportService();
