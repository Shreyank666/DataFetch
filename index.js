const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const cors = require('cors'); // Import CORS middleware

const app = express();

// Enable CORS for all routes (or restrict to specific origins if needed)
app.use(cors({
    origin: 'https://www.98fastbet.com' // Allow only this origin for security
}));

// Define the port for local development or Render deployment
const PORT = process.env.PORT || 3000;

// Scraper Routes
app.get('/api/subscription-state', async (req, res) => {
    try {
        const apiKey = 'ced26f3a4b1a8b74418acd8fad1e9d90';
        const domain = 'https://www.shrimatka.in';

        // Fix the API URL construction (missing backticks)
        const apiUrl = `https://www.push.shrimatka.in/api/subscription-state/?key=${apiKey}&domain=${domain}`;

        // 1️⃣ Fetch API Data
        const apiResponse = await axios.get(apiUrl);
        console.log('API Response:', apiResponse.data);

        // 2️⃣ Fetch HTML Content using Axios
        const { data: htmlContent } = await axios.get(domain);
        const $ = cheerio.load(htmlContent); // Load HTML into Cheerio

        // 3️⃣ Extract Market Data
        const markets = [];
        $('.clmn.clmn6.mblinbk.center').each((i, el) => {
            const marketName = $(el).find('h2.center.font125').text().trim();
            const openNumber = $(el).find('.v-center .font150:nth-child(1)').text().trim();
            const jodiDigit = $(el).find('.v-center b.font4').text().trim();
            const closeNumber = $(el).find('.v-center .font150:nth-child(3)').text().trim();
            const openTime = $(el).find('.cmlo.font1 .clmn.clmn6.center.mblinbk span').first().text().trim();
            const closeTime = $(el).find('.cmlo.font1 .clmn.clmn6.center.mblinbk span').last().text().trim();
            if (marketName) {
                markets.push({ marketName, openNumber, jodiDigit, closeNumber, openTime, closeTime });
            }
        });

        // 4️⃣ Extract Market Open Close Chart Data
        const chartData = [];
        $('table tr').each((i, row) => {
            const cells = $(row).find('td');
            if (cells.length >= 3) {
                chartData.push({
                    market: $(cells[0]).text().trim(),
                    openTime: $(cells[1]).text().trim(),
                    closeTime: $(cells[2]).text().trim(),
                    chartLink: $(cells[3]).find('a').attr('href') || '#'
                });
            }
        });

        // ✅ Send Response
        res.json({
            message: 'Data fetched and scraped successfully',
            subscriptionState: apiResponse.data,
            scrapedData: { markets, chartData }
        });
    } catch (error) {
        console.error('Error fetching or scraping data:', error.message);
        res.status(500).json({
            error: 'An error occurred while fetching or scraping data',
            details: error.message
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});