var KEY = process.env.KEY;

if(KEY === undefined) {
	throw new Error('need api key');
} 

var googleMapsClient = require('@google/maps').createClient({
  key: KEY
});


function geoCodeArray(array) {

	array.map( record => {

		googleMapsClient.geocode({
		  address: 
		}, function(err, response) {
		  if (!err) {
		  	var geometry = response.json.results[0].geometry.location;
		    console.log(geometry);
		  }
		});			
	})

}