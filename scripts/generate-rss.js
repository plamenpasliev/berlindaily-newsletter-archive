const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// CONFIGURATION
const baseUrl = 'https://newsletter.berlindaily.org';
const siteTitle = "Berlin Daily";
const siteDescription = "Your daily dose of Berlin news.";
const archiveDir = path.join(__dirname, '../archive');
const outputFilePath = path.join(__dirname, '../feed.xml');

let rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>${siteTitle}</title>
  <link>${baseUrl}</link>
  <description>${siteDescription}</description>
`;

fs.readdir(archiveDir, (err, files) => {
    if (err) {
        console.error('Could not list the archive directory.', err);
        process.exit(1);
    }

    const posts = [];

    files
        .filter(file => file.endsWith('.html'))
        .forEach(file => {
            const filePath = path.join(archiveDir, file);
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const dom = new JSDOM(fileContent);
            const doc = dom.window.document;

            const title = doc.querySelector('title') ? doc.querySelector('title').textContent : 'No Title';
            
            // --- UPDATED EXCERPT LOGIC ---
            const excerptEl = doc.querySelector('.excerpt');
            // Using innerHTML preserves the link to Berliner Zeitung
            let description = excerptEl ? excerptEl.innerHTML.trim() : '';
            
            if (!description) {
                 // Fallback for older files that might not have the class
                const firstP = doc.querySelector('p');
                description = firstP ? firstP.textContent.substring(0, 150) + '...' : 'No description.';
            }

            const dateMeta = doc.querySelector('meta[name="publish-date"]');
            const dateObj = dateMeta ? new Date(dateMeta.content) : fs.statSync(filePath).birthtime;
            
            posts.push({
                title: title,
                link: `${baseUrl}/archive/${file}`,
                description: description,
                date: dateObj
            });
        });

    // Sort by Date (Newest First)
    posts.sort((a, b) => b.date - a.date);

    // Generate XML Items (Limit to 50)
    posts.slice(0, 50).forEach(post => {
        rssXml += `
  <item>
    <title><![CDATA[${post.title}]]></title>
    <link>${post.link}</link>
    <description><![CDATA[${post.description}]]></description>
    <pubDate>${post.date.toUTCString()}</pubDate>
    <guid>${post.link}</guid>
  </item>
`;
    });

    rssXml += `
</channel>
</rss>`;

    fs.writeFileSync(outputFilePath, rssXml);
    console.log(`Successfully generated feed.xml with ${posts.length} items.`);
});