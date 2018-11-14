const KEY = process.env.KEY;
const FILE_HEAD = process.argv[2];
const FILE = FILE_HEAD + '.csv';

if(KEY === undefined) {
	throw new Error('need api key');
} 

var fs = require('fs');
var throttledQueue = require('throttled-queue');
var axios = require('axios');
var parse = require('csv-parse');
var json2csv = require('json2csv').parse;
var throttle = throttledQueue(10, 1200);
var googleMapsClient = require('@google/maps').createClient({
  key: KEY
});

start();

function start() {

	var json_file_data;

	fs.createReadStream(FILE).pipe(parse({
		delimeter: ',',
		columns: true
	}, (err, data) => {

		if(err) throw err;

		json_file_data = data;
		console.log(json_file_data.length + ' records in ' + FILE_HEAD);
		initiateGeocode(json_file_data);		
	}));

}

function initiateGeocode(array) {

	var geo_coded_array = [];

	getArray(array, data => {
		console.log('\n$$$In last step$$$');
		geo_coded_array = data;
		console.log(geo_coded_array.length + ' records');

  		// var fields = ['CDSCode', 'NCESDist', 'NCESSchool', 'StatusType', 'County', 'District', 'School', 'Street',
  		// 			  'StreetAbr', 'City', 'Zip', 'State', 'MailStreet', 'MailStrAbr', 'MailCity', 'MailZip', 'MailState',
  		// 			  'Phone', 'Ext', 'WebSite', 'OpenDate', 'ClosedDate', 'Charter', 'CharterNum', 'FundingType', 'DOC',
  		// 			  'DOCType', 'SOC', 'SOCType', 'EdOpsCode', 'EdOpsName', 'EILCode', 'EILName', 'GSoffered', 'GSserved',
  		// 			  'Virtual', 'Magnet', 'Latitude', 'Longitude', 'AdmFName1', 'AdmLName1', 'AdmEmail1', 'AdmFName2',
  		// 			  'AdmLName2', 'AdmEmail2', 'AdmFName3', 'AdmLName3', 'AdmEmail3', 'LastUpDate'];
  		// var opts = {fields};

		try {			
			var csv = json2csv(geo_coded_array);

			fs.writeFile(FILE_HEAD + '-geocoded.csv', csv, function(err) {
				if(err) console.log(err);

				console.log('FILE CREATED');
			})
		} catch(err) {
			console.log(err);
		}
	});
}

// OLD
// function getArray(array, callback) {

// 	var results = [];
// 	console.log('\nGeocoding json file data...');
// 	array.map(record => {

// 		var r_address = record.Street + ' ' + record.City + ', ' + record.State + ' ' + record.Zip;
// 		var r_coordinates;

// 		getAddress(r_address, geo => {
// 			console.log(r_address, geo);
// 			record.Latitude = geo.lat;
// 			record.Longitude = geo.lng;
// 			var new_record = record;

// 			results.push(new_record);
// 			console.log('Results array length: ' + results.length);

// 			if(results.length % 40 == 0) {
				
// 			}

// 			if(results.length === array.length) callback(results);
// 		});
// 	})
// }


function getArray(array, callback) {

	var results = [];
	console.log('\nGeocoding json file data...');
	array.map(record => {

		throttle(function() {
			var r_address = record.Street + ' ' + record.City + ', ' + record.State + ' ' + record.Zip;
			var r_coordinates;

			// axios.get('https://maps.googleapis.com/maps/api/geocode/json?address='+ r_address +'&key=' + KEY)
			axios.get('https://maps.googleapis.com/maps/api/geocode/json?address='+ record.Street + '+' + record.City + '+' + record.State + '+' + record.Zip +'&key=' + KEY)
			  .then(res => {
			  	if(res.data.results[0]) {
				  	var geometry = res.data.results[0].geometry.location;

					console.log(r_address, geometry);
					record.Latitude = geometry.lat;
					record.Longitude = geometry.lng;
					var new_record = record;

					results.push(new_record);
					console.log('Results array length: ' + results.length);

					if(results.length === 3071 || results.length > 3069) callback(results);
				  	// callback(geometry);
				}
			  })
			  .catch(err => {
			  	console.log('ERROR\nERROR\nERROR');

			  	console.log(err.data);
			  })			
		});

	})
}



// function getAddress(addr, callback) {

// 	console.log('getting coordinates for: ' + addr);
// 	googleMapsClient.geocode({
// 	  address: addr
// 	}, function(err, response) {
// 		if(err) console.log(err);

// 		// console.log(response);
// 	  	var geometry = response.json.results[0].geometry.location;
// 	    callback(geometry);
// 	});			
// }


function getAddress(addr, callback) {

	axios.get('https://maps.googleapis.com/maps/api/geocode/json?address='+ addr +'&key=' + KEY)
	  .then(res => {
	  	var geometry = res.data.results[0].geometry.location;
	  	console.log(geometry);
	  	callback(geometry);
	  })
	  .catch(err => {
	  	console.log(err);
	  })

	// console.log('getting coordinates for: ' + addr);
	// googleMapsClient.geocode({
	//   address: addr
	// }, function(err, response) {
	// 	if(err) console.log(err);

	// 	// console.log(response);
	//   	var geometry = response.json.results[0].geometry.location;
	//     callback(geometry);
	// });			
}