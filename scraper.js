const puppeteer = require('puppeteer-extra');

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

const { executablePath } = require('puppeteer');

module.exports = {
    title: title,
};

async function title(url) {
    const browser = await puppeteer.launch({ headless: true, executablePath: executablePath() });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    await page.setViewport({ width: 1200, height: 720 });
    await page.goto(url);
    await closeCookieModal(page);
    let movie = await page.$eval('.ant-select-selector', () => false).catch(() => true);
    let result = [];
    try {
        if (movie) {
            result = await getSongs(page, null);
        } else {
            const seasonSelector = "h4[class^='BlocksHeadings__H4']";
            await page.waitForSelector(seasonSelector);
            let seasons = await page.$$(seasonSelector);
            const numberOfSeasons = seasons.length;
            let resultEpisode = [];
            for (let index = 0; index < numberOfSeasons; index++) {
                await page.waitForSelector(seasonSelector);
                seasons = await page.$$(seasonSelector);
                resultEpisode = await getSongsBySeason(page, seasons[index], index + 1);
                result = result.concat(resultEpisode);
                if (index < numberOfSeasons - 1) {
                    await page.goto(url);
                    await page.waitForTimeout(4000);
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
    return result;
}

async function closeCookieModal(page) {
    await page.waitForTimeout(4000);
    const cookieModalSelector = 'button[mode="primary"]';
    await page.waitForSelector(cookieModalSelector);
    const buttonCookies = await page.$$(cookieModalSelector);
    if (buttonCookies.length > 0) {
        await buttonCookies[0].click();
    }
}

async function getSongsBySeason(page, element, season) {
    await element.click();
    await page.waitForTimeout(4000);
    return await getSongsEpisodes(page, season, null);
}

async function getSongsEpisodes(page, season, limit) {
    var result = [];
    const episodeSelector = 'h4[class^="BlocksHeadings__H4"]';
    await page.waitForSelector(episodeSelector);
    const episodes = await page.$$(episodeSelector);
    await episodes[0].click();
    await page.waitForTimeout(4000);
    const songs = await getSongs(page, season);
    result = result.concat(songs);
    let existNext = true;
    while (existNext || limit-- > 0) {
        const buttons = await page.$$('button[class^="Button__StyledButton"]');
        let disabledHandle = await buttons[3].getProperty('disabled');
        let disabled = await disabledHandle.jsonValue();
        if (disabled) {
            existNext = false;
            continue;
        }
        await buttons[3].click();
        await page.waitForTimeout(4000);
        const songs = await getSongs(page, season);
        result = result.concat(songs);
    }
    return result;
}

async function getSongs(page, season) {
    var result = [];
    const rowSelector = 'div[class^="ant-row ant-row-no-wrap ant-row-start"]';
    await page.waitForSelector(rowSelector);
    let episodeTitle = null;
    if (season != null) {
        const h2Selector = 'h2[class^="BlocksHeadings__H2"]';
        const h2Elements = await page.$(h2Selector);
        episodeTitle = await page.evaluate(el => el.textContent, h2Elements);
    }
    const songs = await page.$$(rowSelector);
    for (let index = 0; index < songs.length; index++) {
        const item = songs[index];
        const titleElement = await item.$('p[class^="BlocksCommon"]');
        if (titleElement == null) {
            continue;
        }
        const songTitle = await titleElement.evaluate(element => element.textContent);
        const song = {
            "season": season,
            "episode": getEpisode(episodeTitle),
            "name": cleanSongTitle(songTitle.trim()),
            "artists": [],
        };
        const artistsElement = await item.$$('a[href^="/artist/"]');
        for (let index = 0; index < artistsElement.length; index++) {
            const artistText = await artistsElement[index].evaluate(element => element.textContent);
            song.artists.push(artistText.trim());
        }
        result.push(song);
    }
    return result;
}

function getEpisode(title) {
    if (title == null) {
        return null;
    }
    const regex = /.*\|.*\|(.*)/gm;
    return regex.exec(title)[1].trim();
}

function cleanSongTitle(title) {
    // Remove the text between brackets
    var regex = /\[.*?\]/gm;
    title = title.replace(regex, '').trim();
    // Remove the text between parentheses if it doesn't contain the word "feat"
    regex = /\((?![^()]*feat)[^()]*\)/gm;
    return title.replace(regex, '').trim();
}