// This script reads all individual newsletter HTML files from the 'archive' directory,
// extracts metadata, and injects it into the 'newsletter_archive.html' template.

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const archiveDir = path.join(__dirname, '../archive');
const archiveTemplatePath = path.join(__dirname, '../newsletter_archive.html');
const outputFilePath = path.join(__dirname, '../newsletter_archive.html');

// 1. Read all files from the 'archive' directory
fs.readdir(archiveDir, (err, files) => {
    if (err) {
        console.error('Could not list the directory.', err);
        process.exit(1);
    }

    const newslettersData = files
        .filter(file => file.endsWith('.html')) // Only process HTML files
        .map(file => {
            const filePath = path.join(archiveDir, file);
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const dom = new JSDOM(fileContent);
            const doc = dom.window.document;

            // 2. Extract the required data using a consistent structure
            const title = doc.querySelector('title').textContent;
            const dateMeta = doc.querySelector('meta[name="publish-date"]');
            const date = dateMeta ? new Date(dateMeta.content).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'No Date';
            const year = dateMeta ? new Date(dateMeta.content).getFullYear().toString() : 'N/A';
            const excerpt = doc.querySelector('p.excerpt') ? doc.querySelector('p.excerpt').textContent : 'No excerpt found.';
            const href = `archive/${file}`; // Link to the actual issue file

            return { title, date, year, excerpt, href };
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date, newest first

    // 3. Read the archive page template
    let archiveContent = fs.readFileSync(archiveTemplatePath, 'utf-8');

    // 4. Inject the data into the template
    // The placeholder in the HTML file looks like: const newsletters = []; /* NEWSLETTER_DATA_PLACEHOLDER */
    const dataString = JSON.stringify(newslettersData, null, 4);
    const replacementString = `const newsletters = ${dataString};`;
    archiveContent = archiveContent.replace(/const newsletters = \[\]; \/\* NEWSLETTER_DATA_PLACEHOLDER \*\//, replacementString);

    // 5. Write the updated content back to the archive file
    fs.writeFileSync(outputFilePath, archiveContent);

    console.log(`Successfully updated newsletter archive with ${newslettersData.length} issues.`);
});
