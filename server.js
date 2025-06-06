import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import seedrandom from "seedrandom";
import { fakerEN, fakerRU, fakerFR } from "@faker-js/faker";
import Jimp from "jimp";
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function hashStringToNumber(str) {
  const hash = crypto.createHash("sha256").update(str).digest("hex");
  return parseInt(hash.slice(0, 15), 16);
}

app.get("/api/books", (req, res) => {
  try {
    const langRaw = String(req.query.lang || "en").toLowerCase();
    const seedValue = String(req.query.seed || "1");
    const avgLikes = parseFloat(req.query.avgLikes) || 0;
    const avgRev = parseFloat(req.query.avgReviews) || 0;
    let batch = parseInt(req.query.batch, 10);
    if (isNaN(batch) || batch < 1) batch = 1;

    let fakerInstance;
    let isbnGroupDigit;
    if (langRaw === "ru") {
      fakerInstance = fakerRU;
      isbnGroupDigit = "7";
    } else if (langRaw === "fr") {
      fakerInstance = fakerFR;
      isbnGroupDigit = "2";
    } else {
      fakerInstance = fakerEN;
      isbnGroupDigit = "1";
    }

    const combinedSeedString = `${seedValue}-${batch}`;
    const combinedSeedNum = hashStringToNumber(combinedSeedString);
    fakerInstance.seed(combinedSeedNum);
    const rng = seedrandom(combinedSeedNum);

    let pageSize, startIndex;
    if (batch === 1) {
      pageSize = 20;
      startIndex = 0;
    } else {
      pageSize = 10;
      startIndex = 20 + (batch - 2) * 10;
    }

    const books = [];
    for (let i = 0; i < pageSize; i++) {
      const globalIndex = startIndex + i;
      const publisherCode = String(
        fakerInstance.number.int({ min: 0, max: 999 })
      ).padStart(3, "0");
      const bookCode = String(
        fakerInstance.number.int({ min: 0, max: 99999 })
      ).padStart(5, "0");
      const checkDigit = String(fakerInstance.number.int({ min: 0, max: 9 }));
      const isbn = `978-${isbnGroupDigit}-${publisherCode}-${bookCode}-${checkDigit}`;
      const title = fakerInstance.commerce.productName();
      const author = `${fakerInstance.person.firstName()} ${fakerInstance.person.lastName()}`;
      const publisher = fakerInstance.company.name();
      const year = fakerInstance.number.int({ min: 2000, max: 2023 });

      const baseLikes = Math.floor(avgLikes);
      const fracLikes = avgLikes - baseLikes;
      const rValLikes = rng();
      const likes = baseLikes + (rValLikes < fracLikes ? 1 : 0);

      const baseRev = Math.floor(avgRev);
      const fracRev = avgRev - baseRev;
      const rValRev = rng();
      const reviewsCount = baseRev + (rValRev < fracRev ? 1 : 0);

      const reviews = [];
      for (let r = 0; r < reviewsCount; r++) {
        const reviewer = `${fakerInstance.person.firstName()} ${fakerInstance.person.lastName()}`;
        const company = fakerInstance.company.name();
        const text = fakerInstance.lorem.sentence();
        reviews.push({ reviewer, company, text });
      }

      const coverUrl = `https://picsum.photos/seed/${seedValue}-${batch}-${globalIndex}/200/300`;

      books.push({
        id: globalIndex,
        isbn,
        title,
        author,
        publisher,
        year,
        likes,
        reviewsCount,
        reviews,
        coverUrl,
      });
    }

    return res.json({ books });
  } catch (err) {
    console.error("Error in /api/books:", err);
    return res
      .status(500)
      .json({ error: "Internal Server Error in /api/books" });
  }
});

app.get("/api/cover", async (req, res) => {
  try {
    const rawTitle = String(req.query.title || "");
    const rawAuthor = String(req.query.author || "");

    const seed = String(req.query.seed || "1");
    const batch = parseInt(req.query.batch, 10) || 1;
    const idx = parseInt(req.query.idx, 10) || 0;

    const hashToNumber = (s) => {
      const h = crypto.createHash("sha256").update(s).digest("hex");

      return parseInt(h.slice(0, 8), 16);
    };
    const hue = hashToNumber(`${seed}-${batch}-${idx}-bg`) % 360;
    const WIDTH = 200;
    const HEIGHT = 300;
    const image = new Jimp(
      WIDTH,
      HEIGHT,
      Jimp.cssColorToHex(`hsl(${hue}, 40%, 80%)`)
    );
    const fontTitle = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    const fontAuthor = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
    image.print(
      fontTitle,
      8,
      8,
      {
        text: rawTitle,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_TOP,
      },
      WIDTH - 16,
      0
    );

    image.print(
      fontAuthor,
      8,
      HEIGHT - 30,
      {
        text: `by ${rawAuthor}`,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_TOP,
      },
      WIDTH - 16,
      0
    );
    const buffer = await image.getBufferAsync(Jimp.MIME_PNG);
    res.writeHead(200, {
      "Content-Type": "image/png",
      "Cache-Control": "no-cache",
    });
    return res.end(buffer);
  } catch (err) {
    console.error("Error in /api/cover:", err);
    return res.status(500).send("Cover generation error");
  }
});

app.get("/api/books/export", (req, res) => {
  try {
    const lang = String(req.query.lang || "en").toLowerCase();
    const seed = String(req.query.seed || "1");
    const avgLikes = parseFloat(req.query.avgLikes) || 0;
    const avgReviews = parseFloat(req.query.avgReviews) || 0;
    const count = parseInt(req.query.count, 10) || 0;
    if (count <= 0) {
      return res.status(400).send("Count must be > 0");
    }

    const booksToExport = [];
    const pages = [];
    if (count <= 20) {
      pages.push({ batch: 1, take: count });
    } else {
      pages.push({ batch: 1, take: 20 });
      let remain = count - 20;
      let pageNum = 2;
      while (remain > 0) {
        const take = Math.min(remain, 10);
        pages.push({ batch: pageNum, take });
        remain -= take;
        pageNum++;
      }
    }

    const generateBooksForBatch = (batch, take) => {
      let faker;
      if (lang === "ru") {
        faker = fakerRU;
      } else if (lang === "fr") {
        faker = fakerFR;
      } else {
        faker = fakerEN;
      }

      const combinedSeedNum = hashStringToNumber(`${seed}-${batch}`);
      seedrandom(combinedSeedNum, { global: true });
      faker.seed(combinedSeedNum);

      const startIndex = batch === 1 ? 0 : 20 + (batch - 2) * 10;
      const arr = [];

      for (let i = 0; i < take; i++) {
        const globalIndex = startIndex + i;
        const wc = faker.number.int({ min: 2, max: 4 });
        const title = fakerInstance.commerce.productName();
        const author = `${fakerInstance.person.firstName()} ${fakerInstance.person.lastName()}`;
        const publisher = fakerInstance.company.name();
        const maxL = Math.ceil(avgLikes * 2);
        const likes = fakerInstance.number.int({ min: 0, max: maxL });
        const maxR = Math.ceil(avgReviews * 2);
        const reviewsCount = fakerInstance.number.int({ min: 0, max: maxR });
        const reviews = [];
        for (let r = 0; r < reviewsCount; r++) {
          reviews.push(fakerInstance.lorem.sentence());
        }

        arr.push({
          id: globalIndex,
          title,
          author,
          publisher,
          likes,
          reviewsCount,
          reviews,
        });
      }
      return arr;
    };

    pages.forEach(({ batch, take }) => {
      booksToExport.push(...generateBooksForBatch(batch, take));
    });

    const header = [
      "ID",
      "Title",
      "Author",
      "Publisher",
      "Likes",
      "ReviewsCount",
    ];
    let maxReviewsInList = 0;
    booksToExport.forEach((bk) => {
      if (bk.reviews.length > maxReviewsInList) {
        maxReviewsInList = bk.reviews.length;
      }
    });
    for (let i = 0; i < maxReviewsInList; i++) {
      header.push(`Review${i + 1}`);
    }

    const timestamp = Date.now();
    const filename = `books_${lang}_${seed}_${timestamp}.csv`;
    res.setHeader("Content-Type", "text/csv; charset=UTF-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.write("\uFEFF");

    function escapeCsv(val) {
      if (val == null) return "";
      const str = String(val);
      if (/["\n,]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }

    const headerLine = header.map((h) => escapeCsv(h)).join(",") + "\r\n";
    res.write(headerLine);

    booksToExport.forEach((bk) => {
      const rowArray = [
        bk.id,
        bk.title,
        bk.author,
        bk.publisher,
        bk.likes,
        bk.reviewsCount,
      ];
      for (let i = 0; i < maxReviewsInList; i++) {
        rowArray.push(bk.reviews[i] || "");
      }
      const line = rowArray.map((x) => escapeCsv(x)).join(",") + "\r\n";
      res.write(line);
    });

    return res.end();
  } catch (err) {
    console.error("Error in /api/books/export:", err);
    return res.status(500).send("CSV export error");
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "dist")));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(
    `Backend is running on port ${PORT} [${process.env.NODE_ENV || "dev"}]`
  );
});
