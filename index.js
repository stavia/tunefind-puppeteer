const yargs = require('yargs');
const scraper = require('./scraper');

const argv = yargs
    .command('title [url]', 'Returns the HTML of the title', {
        id: {
            description: 'URL of the title in tunefind. For example: https://www.tunefind.com/show/the-last-of-us/season-1',
            type: 'string',
        }
    })
    .help()
    .alias('help', 'h')
    .argv;

if (argv._.includes('title')) {
    try {
        (async () => {
            if (!argv.url) {
                console.log("The URL of the title is required");
                process.exit(1);
            }
            let result = await scraper.title(argv.url);
            process.stdout.write(JSON.stringify(result));
            process.exit(0);
        })()
    } catch (err) {
        console.error(err)
        process.exit(1);
    }
}
