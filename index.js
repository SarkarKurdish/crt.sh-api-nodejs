const request = require("request-promise");
const cheerio = require("cheerio");
const encodeUrl = require('encodeurl');
const readline = require('readline');

(async _ => {

    let domainName = await askQuestion("Domain name: ");

    domainName = domainName.replace("https://", "").replace("http://", "").replace("www.", "").replace(/\//g, "");

    const url = "https://crt.sh/?q=" + domainName;
    const options = {
        url: url
    };
    const html = await request(options);
    const $ = cheerio.load(html);

    const tables = $("tr").map((i, e) => {
        const tds = [].slice.call($(e).find("td"));

        return ($(tds[5]).html() || "").trim()
    }).get()


    const blackList= [
        domainName,
        `*.${domainName}`,
        `www.${domainName}`
    ];

    let subdomains = [];
    tables.filter(e => {
        const data = e.split("<br>").forEach(e => {
            if(blackList.indexOf(e.trim()) === -1&& subdomains.indexOf(e.trim()) === -1 && e.trim().length && e.trim().indexOf(domainName) !== -1) subdomains.push(e.trim())
        });
    });

    for (let i = 0; i < subdomains.length; i++) {
        const sub = "http://"+subdomains[i];

        const options = {
            url: encodeUrl(sub),
            resolveWithFullResponse: true
        }

        try{
            const data = await request(options);
            if(data.statusCode >= 200 && data.statusCode < 400)
            console.log('\x1b[32m', `${sub}: ${data.statusCode}`);
            else
            console.log('\x1b[31m', `${sub}: ${data.statusCode}`);

        }catch(e){
        }
        
    }

})();


function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}