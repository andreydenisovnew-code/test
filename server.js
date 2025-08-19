import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());

// 📂 Папка для хранения писем
const LETTERS_DIR = path.join(process.cwd(), "letters");
if (!fs.existsSync(LETTERS_DIR)) {
  fs.mkdirSync(LETTERS_DIR);
}

// 📦 Подключаем БД SQLite
let db;
(async () => {
  db = await open({
    filename: "mail.db",
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS mails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      senderFirst TEXT,
      senderLast TEXT,
      senderMiddle TEXT,
      senderAddress TEXT,
      recipientFirst TEXT,
      recipientLast TEXT,
      recipientMiddle TEXT,
      recipientAddress TEXT,
      fileName TEXT
    )
  `);
})();

// 📩 POST /api/mails — сохранить письмо
app.post("/api/mails", async (req, res) => {
  try {
console.log("📩 Пришло письмо:", req.body);
    const {
      senderFirst,
      senderLast,
      senderMiddle,
      senderAddress,
      recipientFirst,
      recipientLast,
      recipientMiddle,
      recipientAddress,
      body,
    } = req.body;

    if (
      !senderFirst ||
      !senderLast ||
      !senderAddress ||
      !recipientFirst ||
      !recipientLast ||
      !recipientAddress ||
      !body
    ) {
console.log("⚠️ Ошибка: не все поля заполнены", req.body);
      return res.status(400).json({ error: "Не все поля заполнены" });
    }

    // имя файла для письма
    const fileName = `letter_${Date.now()}.txt`;
    const filePath = path.join(LETTERS_DIR, fileName);

    // сохраняем письмо в файл
    fs.writeFileSync(filePath, body, "utf8");

    // сохраняем запись в БД
    await db.run(
      `INSERT INTO mails 
      (senderFirst, senderLast, senderMiddle, senderAddress, 
       recipientFirst, recipientLast, recipientMiddle, recipientAddress, fileName)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        senderFirst,
        senderLast,
        senderMiddle || "",
        senderAddress,
        recipientFirst,
        recipientLast,
        recipientMiddle || "",
        recipientAddress,
        fileName,
      ]
    );

    res.json({ message: "Письмо сохранено", file: fileName });
  } catch (err) {
    console.error("Ошибка при сохранении письма:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// 📜 GET /api/mails — список писем
app.get("/api/mails", async (req, res) => {
  try {
    const mails = await db.all("SELECT * FROM mails");
    res.json(mails);
  } catch (err) {
    console.error("Ошибка при получении писем:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// 🚀 Запускаем сервер
// 🚀 Запускаем сервер
const PORT = process.env.PORT || 4000; // Render даст свой порт, локально останется 4000
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
