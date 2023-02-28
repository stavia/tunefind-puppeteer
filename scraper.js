const puppeteer = require('puppeteer-extra');

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

const { executablePath } = require('puppeteer');

module.exports = {
    title: title,
};

async function title(url) {
    //const browser = await puppeteer.launch({ headless: true });
    const browser = await puppeteer.launch({ headless: true, executablePath: executablePath() });
    page = await browser.newPage();
    //await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36');
    await page.setDefaultNavigationTimeout(0);
    await page.setViewport({ width: 1200, height: 720 });
    await page.goto(url);
    await page.waitForSelector('.container');
    let movie = await page.$eval('#season-dropdown', () => false).catch(() => true);
    if (movie) {
        //console.log('MOVIE');
    } else {
        //console.log('SERIE');
        let episodes = await page.$$('h3[class^="EpisodeListItem_title"]');
        let episodesLinks = []
        for (let index = 0; index < episodes.length; index++) {
            let anchorElement = await episodes[index].$('a[href]');
            let episodeUrl = await anchorElement.evaluate(element => element.href);
            let episodeName = await anchorElement.evaluate(element => element.textContent);
            episodesLinks.push({
                name: episodeName,
                link: episodeUrl,
            });
        }
        return getSongs(episodesLinks);
    }
    // if (isAMovie(page)) {
    // } else {
    // }
    //let html = await page.evaluate(() => document.documentElement.outerHTML);
    //await browser.close();
    //return html;
}

async function getSongs(episodesLinks) {
    var result = [];
    for (const { name, link } of episodesLinks) {
        await page.goto(link);
        await page.waitForSelector('.container');
        const songs = await page.$$('div[class^="SongRow_container"]');
        for (let index = 0; index < songs.length; index++) {
            const item = songs[index];
            const titleElement = await item.$('h4[class^="SongTitle_heading"]');
            const songTitle = await titleElement.evaluate(element => element.textContent);
            const song = {
                "episode": name,
                "name": songTitle,
                "artists": [],
            };
            const artistsElement = await item.$$('a[class^="ArtistSubtitle_subtitle"]');
            for (let index = 0; index < artistsElement.length; index++) {
                const artistText = await artistsElement[index].evaluate(element => element.textContent);
                song.artists.push(artistText);
            }
            result.push(song);
        }
    }
    return result;
}