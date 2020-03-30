(async () => {
  const {writeFileSync} = require('fs');
  const pify = require('pify');
  const citysdk_ = require("citysdk");
  const citysdk = pify(citysdk_);

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
  function pad(num) {
    if (num < 10) {
      return `0${num}`;
    } else {
      return `${num}`;
    }
  }

  const acc = {};
  const csvData = [];

  for (let state = 0; state < 60; state++) {
    console.log(`Fetching state ${state}`);
    const res = await citysdk({
      vintage : 2017,        // required
      geoHierarchy : {       // required  
        state: pad(state), // https://www.census.gov/programs-surveys/geography/guidance/geo-identifiers.html
        // state : {
        //   lat : 45.5103513,
        //   lng : -122.6740118
        // },
        county: '*'
      },
      // Source: https://github.com/loganpowell/census-geojson/tree/master/public/census#parameters
      sourcePath : ["pep","population"],  // required 
      values : ["DENSITY","POP"]     // required 
    });

    res.forEach(item => {
      acc[`${item.state}${item.county}`] = item.POP
      csvData.push(`"${item.state}${item.county}", ${item.POP}`)
    })
    await sleep(250);
  }

  writeFileSync('fips-population.json', JSON.stringify(acc, null, 2));
  writeFileSync('fips-population.csv', csvData.join('\n'));

})();

