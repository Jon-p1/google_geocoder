var KEY = process.env.KEY;

if(KEY === undefined) {
	throw new Error('need api key');
} 

var googleMapsClient = require('@google/maps').createClient({
  key: KEY
});

googleMapsClient.geocode({
  address: '1600 Amphitheatre Parkway, Mountain View, CA'
}, function(err, response) {
  if (!err) {
    console.log(response.json.results[0].geometry.location);
  }
});