// https://www.npmjs.com/package/twitter-stream-api
var TwitterStream = require('twitter-stream-api');
var fs = require('fs');
var yaml=require('js-yaml');
var solace = require('solclientjs');

/** CONFIG **/
var twtcfg = null;
var solcfg = null;

try {
    let config  = yaml.safeLoad( fs.readFileSync('./tw2sol.yml', 'utf8') ); 
    twtcfg = config['twitter-stream-api'];
    solcfg = config['solclientjs'];
} catch (e) {
    console.log(e);
    process.exit(1);
}

/** THE SOLACE BIT **/
var sprops = new solace.SolclientFactoryProperties();
sprops.profile = solace.SolclientFactoryProfiles.version10;
solace.SolclientFactory.init(sprops);

var solsess = solace.SolclientFactory.createSession({
    url:      solcfg.host,
    vpnName:  solcfg.vpn,
    userName: solcfg.user,
    password: solcfg.password
});

try {
    solsess.connect();
} catch (error) {
    console.log(error.toString());
}

solsess.on(solace.SessionEventCode.UP_NOTICE, function (evt) {
    console.log('CONNECTED to solace ' + solcfg.host );
    // Don't start the twitter stream until we know we have a connection
    startTwitterStream() ;
});

function solsend( msgtext ) {
    console.log('sending to ' + solcfg.sendto );
    var msg = solace.SolclientFactory.createMessage();
    msg.setDestination( solace.SolclientFactory.createTopicDestination(solcfg.sendto) );
    msg.setBinaryAttachment( msgtext );
    msg.setDeliveryMode( solace.MessageDeliveryModeType.DIRECT );
    if (solsess !== null) {
        try {
            solsess.send( msg );
        } catch (error) {
            console.log(error.toString());
        }
    } else {
        console.log('Cannot publish because not connected to Solace message router.');
    }
}


/** THE TWITTER BIT **/
var Twitter = new TwitterStream(twtcfg.keys, false);

function startTwitterStream() {
    Twitter.stream('statuses/filter', {
        track: [ 'coronavirus', 'nyc' ]
    });

    // EVENTS:

    // Obviously the main event:
    Twitter.on('data', function (obj) {
        let jso = JSON.parse(obj);
        solsend( JSON.stringify(jso) );
    });
    // Helpful info:
    Twitter.on('connection success', function (uri) {
        console.log('connection success', uri);
    });
    Twitter.on('data keep-alive', function () {
        console.log('data keep-alive');
    });


    // Errors:
    Twitter.on('connection aborted', function () {
        console.log('connection aborted');
    });
    Twitter.on('connection error network', function (error) {
        console.log('connection error network', error);
    });
    Twitter.on('connection error unknown', function (error) {
        console.log('connection error unknown', error);
        Twitter.close();
    });
    Twitter.on('connection error http', function (httpStatusCode) {
        console.log('connection error http', httpStatusCode);
    });


    // Warnings:
    Twitter.on('connection rate limit', function (httpStatusCode) {
        console.log('connection rate limit', httpStatusCode);
    });
    Twitter.on('connection error stall', function () {
        console.log('connection error stall');
    });
    
}

