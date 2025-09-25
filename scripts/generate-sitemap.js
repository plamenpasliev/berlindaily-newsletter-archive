// This script generates a sitemap.xml file by scanning the HTML files in the archive.

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const baseUrl = 'https://newsletter.berlindaily.org'; // Your website's base URL
const archiveDir = path.join(__dirname, '../archive');
const outputFilePath = path.join(__dirname, '../sitemap.xml');

// Start the XML string for the sitemap
let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

// 1. Add the main pages (homepage and archive page)
sitemapXml += `
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>1.0</priority>
  </url>
`;

// 2. Read all files from the 'archive' directory and add them
fs.readdir(archiveDir, (err, files) => {
    if (err) {
        console.error('Could not list the archive directory.', err);
        process.exit(1);
    }

    files
        .filter(file => file.endsWith('.html'))
        .forEach(file => {
            const filePath = path.join(archiveDir, file);
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const dom = new JSDOM(fileContent);
            const doc = dom.window.document;

            // Extract the publish date for the <lastmod> tag
            const dateMeta = doc.querySelector('meta[name="publish-date"]');
            const lastMod = dateMeta ? new Date(dateMeta.content).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
            
            const url = `${baseUrl}/archive/${file}`;

            sitemapXml += `
  <url>
    <loc>${url}</loc>
    <lastmod>${lastMod}</lastmod>
    <priority>0.8</priority>
  </url>
`;
        });

    // Close the XML tags
    sitemapXml += `</urlset>`;

    // 3. Write the sitemap file
    fs.writeFileSync(outputFilePath, sitemapXml);

    console.log(`Successfully generated sitemap.xml with ${files.length + 2} URLs.`);
});
