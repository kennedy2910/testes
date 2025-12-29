const express = require("express");
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

// pasta tmp
const TMP_DIR = path.join(__dirname, "tmp");
if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR);
}

// expor /tmp publicamente
app.use("/tmp", express.static(TMP_DIR));

app.post("/generate-pdf", async (req, res) => {
  try {
    const { summary } = req.body;

    if (!summary) {
      return res.status(400).json({ error: "summary is required" });
    }

    const html = `
      <!DOCTYPE html>
      <html lang="pt">
        <head>
          <meta charset="UTF-8" />
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
            }
            h1 {
              color: #222;
            }
            ul {
              margin-top: 16px;
            }
            li {
              margin-bottom: 8px;
            }
          </style>
        </head>
        <body>
          <h1>${summary.title}</h1>
          <p>${summary.summary}</p>
          <ul>
            ${(summary.highlights || [])
              .map(item => `<li>${item}</li>`)
              .join("")}
          </ul>
        </body>
      </html>
    `;

    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "networkidle" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true
    });

    await browser.close();

    const filename = `report_${Date.now()}.pdf`;
    const filePath = path.join(TMP_DIR, filename);

    fs.writeFileSync(filePath, pdfBuffer);

    return res.json({
      filename,
      url: `http://localhost:3000/tmp/${filename}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

app.listen(3000, () => {
  console.log("✅ PDF service running at http://localhost:3000");
});
