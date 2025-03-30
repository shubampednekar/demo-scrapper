const express = require("express");
const axios = require("axios");
const cors = require("cors");
const cheerio = require("cheerio");
const { convert } = require("html-to-text"); 

const app = express();
const PORT = process.env.PORT || 3000;

// Set your API key (Use environment variable in production)
const API_KEY = process.env.API_KEY || "your-secret-api-key";

app.use(cors());

app.get("/fetch-content", async (req, res) => {
    const { url } = req.query;
    const apiKey = req.headers["x-api-key"]; // Get API key from headers

    // Check API Key
    if (!apiKey || apiKey !== API_KEY) {
        return res.status(403).json({ error: "Invalid API key" });
    }

    // Check URL Parameter
    if (!url) {
        return res.status(400).json({ error: "URL parameter is required" });
    }

    try {
        const response = await axios.get(url); 
        const html = response.data;

        // Load HTML into Cheerio
        const $ = cheerio.load(html);

        // Extract only the <body> content
        const bodyContent = $("body").html();

        if (!bodyContent) {
            return res.status(404).json({ error: "No body content found" });
        }

        // Convert HTML body to plain text
        const textContent = convert(bodyContent, {
            wordwrap: false, // Prevents text wrapping
            ignoreHref: true, // Ignores links
            ignoreImage: true, // Ignores images
        });

        res.json({ text: textContent });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch site content" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
