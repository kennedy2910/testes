const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const PDFDocument = require("pdfkit")

const app = express()
const PORT = 3000

// ✅ CORS correto (resolve erro do browser)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
)

app.use(bodyParser.json({ limit: "10mb" }))

app.get("/", (req, res) => {
  res.send("PDF Service OK")
})

app.post("/generate-pdf", (req, res) => {
  try {
    const report = req.body

    const doc = new PDFDocument({ margin: 50 })
    const buffers = []

    doc.on("data", buffers.push.bind(buffers))
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(buffers)

      res.setHeader("Content-Type", "application/pdf")
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=relatorio-premium.pdf"
      )

      res.end(pdfBuffer)
    })

    // ===== CONTEÚDO DO PDF =====
    doc.fontSize(18).text(report.title || "Relatório Premium", {
      align: "center"
    })

    doc.moveDown()
    doc.fontSize(12).text(report.overview || "")

    if (report.complement) {
      doc.moveDown()
      doc.fontSize(14).text("Perfil Complementar")
      doc.moveDown(0.5)
      doc.fontSize(12).text(report.complement)
    }

    doc.moveDown()
    doc.fontSize(10).opacity(0.7).text(report.note || "")

    doc.end()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Erro ao gerar PDF" })
  }
})

app.listen(PORT, () => {
  console.log(`✅ PDF service running at http://localhost:${PORT}`)
})
