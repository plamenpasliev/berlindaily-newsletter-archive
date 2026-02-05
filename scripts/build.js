// This script reads all individual newsletter HTML files from the 'archive' directory,
// extracts metadata, and injects it into the 'newsletter_archive_template.html' template and creates "index.html".

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const archiveDir = path.join(__dirname, '../archive');
const archiveTemplatePath = path.join(__dirname, '../assets/newsletter_archive_template.html');
const outputFilePath = path.join(__dirname, '../index.html');

// 1. Check if template file exists
if (!fs.existsSync(archiveTemplatePath)) {
    console.error(`Template file not found at: ${archiveTemplatePath}`);
    process.exit(1);
}

// 2. Read all files from the 'archive' directory
fs.readdir(archiveDir, (err, files) => {
    if (err) {
        console.error('Could not list the directory.', err);
        process.exit(1);
    }

    const newslettersData = files
        .filter(file => file.endsWith('.html') && file !== 'latest.html') // Exclude the latest.html file
        .map(file => {
            const filePath = path.join(archiveDir, file);
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const dom = new JSDOM(fileContent);
            const doc = dom.window.document;

            // Extract the required data using a more robust structure
            const titleTag = doc.querySelector('title');
            let title = titleTag ? titleTag.textContent : 'Untitled Newsletter';
            
            // Remove suffix from title
            title = title.replace(' - Berlin News Daily', '').trim();

            const dateMeta = doc.querySelector('meta[name="publish-date"]');
            const dateObj = dateMeta ? new Date(dateMeta.content) : null;
            
            const date = dateObj ? dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'No Date';
            
            // --- UPDATED: Extract Month-Year tag with a space ---
            const monthYear = dateObj ? dateObj.toLocaleString('en-US', { month: 'short', year: 'numeric' }) : 'N/A';
            
            const excerptElement = doc.querySelector('p.excerpt');
            let excerpt = excerptElement ? excerptElement.textContent.trim() : 'No excerpt available.';
            
            const href = `archive/${file}`; // Link to the actual issue file

            return { title, date, monthYear, excerpt, href };
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date, newest first

    // 3. Read the archive page template
    let archiveContent = fs.readFileSync(archiveTemplatePath, 'utf-8');

    // 4. Inject the data into the template
    const dataString = JSON.stringify(newslettersData, null, 4);
    const replacementString = `const newsletters = ${dataString};`;
    
    // This now correctly finds the placeholder across multiple lines.
    archiveContent = archiveContent.replace(/const newsletters = \[\];\s*\/\* NEWSLETTER_DATA_PLACEHOLDER \*\//, replacementString);

    // 5. Write the updated content back to the archive file
    fs.writeFileSync(outputFilePath, archiveContent);

    console.log(`Successfully updated newsletter archive with ${newslettersData.length} issues.`);
});
