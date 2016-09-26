var express = require('express');
var bodyParser = require("body-parser");
var mailer = require('nodemailer');
var fs = require('fs');
var _ = require('lodash');
var config = require('./config.json');
var app = express();
var GoogleMapsAPI = require('googlemaps');


app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(express.static('public'));

var server = require('http').Server(app);
var port = process.env.PORT || 3000;
var transporter = mailer.createTransport('smtps://'+ config.username +'%40gmail.com:'+ config.password +'@smtp.gmail.com');

var mailOptions = {
    from: '"Pokenoti 👥" <'+ config.from +'>', // sender address
    to: 'kfrenzy@gmail.com', // list of receivers
    subject: 'Notification', // Subject line
    html: ''
};

// pokemon list
var pokemonList = JSON.parse(fs.readFileSync('pokemon.json', 'utf8'));
var rarities = _.uniqBy(_.map(_.values(pokemonList), 'rarity'), function(e) {
    return e;
});
var names = _.map(_.values(pokemonList), 'name');
var wanted = config.wanted;

  console.log('Running server on port ' + port);
  server.listen(port, function (err) {

  console.log('looking for: ');
  console.log('rarity: ', wanted.rarity);
  console.log('name: ',     wanted.name);
});

// API Endpoints
app.get('/names', function(req, res) {
   return res.send(names);
});

app.get('/rarities', function(req, res) {
   return res.send(rarities);
});

app.get('/wanted', function(req, res) {
   return res.send(wanted);
});

app.post('/notify', function(req, res) {
    var type = req.body.type;
    var message = req.body.message;
    var id = message.pokemon_id;
    var pokemon = pokemonList[id];


    if(type === 'pokemon' && check(pokemon)) {
        notify(message);
    }

    res.end();
});

function check(pokemon) {
    var isName = _.isEmpty(wanted.name) || _.indexOf(wanted.name, pokemon.name) > -1;
    var isRarity = _.isEmpty(wanted.rarity) || _.indexOf(wanted.rarity, pokemon.rarity) > -1;

    console.log('checking: ', pokemon.name, ' ', pokemon.rarity);
    return isName && isRarity;
}

function notify(message) {
    var pokemon = pokemonList[message.pokemon_id];

    console.log('sending pokemon ', pokemon.name, ' which is ', pokemon.rarity);

    mailOptions.subject = "Found: " + pokemon.name + " " + pokemon.rarity;

    var disappear_time = new Date(message.disappear_time * 1000));

    mailOptions.html = '<p>disappears: ' + disappear_time + '</p>';
    mailOptions.html += '<p><a href="https://www.google.com/maps/place/'+ message.latitude + ',' + message.longitude +'">Location</a></p>';
    mailOptions.html += '<img src="'+ map(message.latitude, message.longitude) +'" ></img>';

    console.log('sending ', pokemon.name, ' which is ', pokemon.rarity);

    send();
}


function send() {
    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    });
}



function map(lat, long) {
    var gmAPI = new GoogleMapsAPI({
        key: config.mapkey
    });
    var params = {
      center: lat+','+long,
      zoom: 15,
      size: '500x400',
      maptype: 'roadmap',
      markers: [
        {
          location: lat+','+long
        }
      ],

    };
    return gmAPI.staticMap(params); // return static map URL
}


// {
//     "type": "pokemon",
//     "message": {
//         "encounter_id": {{encounter id}},
//         "spawnpoint_id": {{spawnpoint id}},
//         "pokemon_id": {{pokemon id}},
//         "latitude": {{spawn latitude}},
//         "longitude": {{spawn longitude}},
//         "disappear_time": {{disappear timestamp}}
//     }
// }
