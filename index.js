const KEY = process.env.KEY;
const FILE_HEAD = process.argv[2];
const FILE = FILE_HEAD + '.csv';

if(KEY === undefined) {
	throw new Error('need api key');
} 

var fs = require('fs');
var parse = require('csv-parse');
var json2csv = require('json2csv').Parser;
var googleMapsClient = require('@google/maps').createClient({
  key: KEY
});


function start() {

	var json_file;

	fs.createReadStream(FILE).pipe(parsse({
		delimeter: ',',
		columns: true
	}, (err, data) => {

		if(err) throw err;

		json_file = data;
		
	}));

	console.log(json_file);
}

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