const fs = require('fs');
const assert = require('assert').strict;
const Scraper = require('./scraper');

describe("integration test", function () {
    it("should be able to get the Oppenheimer soundtrack", async function () {
        this.timeout(0);
        let expectedResult = fs.readFileSync('./fixtures/oppenheimer.json', 'utf8');
        let url = 'https://www.tunefind.com/movie/oppenheimer-2023';
        let result = await Scraper.title(url);
        assert.equal(JSON.stringify(result), JSON.stringify(JSON.parse(expectedResult)));
    });

    // it("should be able to get the serie Winning Time: The Rise of the Lakers Dynasty soundtrack", async function () {
    //     this.timeout(200000);
    //     let expectedResult = fs.readFileSync('./fixtures/winning-time-the-rise-of-the-lakers-dynasty.json', 'utf8');
    //     let url = 'https://www.tunefind.com/show/winning-time-the-rise-of-the-lakers-dynasty';
    //     let result = await Scraper.title(url);
    //     assert.equal(JSON.stringify(result), JSON.stringify(JSON.parse(expectedResult)));
    // });
});