# tw2sol

Sample node.js twitter-to-Solace bridge, consuming twitter events and publishing them to a Solace PubSub+ event bus. From there it can be consumed, replayed, filtered, bridged to other PubSb+ brokers in other regions or clouds, etc. 

## The Basics

The following is working against my own Twitter Dev Account and a local Solace PubSub+ docker container with non-privileged web-socket port 8008 open for business:

``` bash
xenakis% git clone https://github.com/koverton/tw2sol.git
xenakis% cd tw2sol
xenakis% npm install
npm WARN tw2sol@1.0.0 No repository field.

added 71 packages from 96 contributors and audited 71 packages in 2.244s

1 package is looking for funding
  run `npm fund` for details

found 0 vulnerabilities

xenakis% node tw2sol.js
CONNECTED to solace ws://localhost:8008
connection success https://stream.twitter.com/1.1/statuses/filter.json?track=coronavirus%2Cnyc
sending to solace/twitter/live
sending to solace/twitter/live
...
```

## Configuration

Configure it via the [tw2sol.yml](./tw2sol.yml) configuration file here in the project directory. 

### Twitter streaming API configuration

You will need to sign up for a developer account on their [Developer Portal](https://developer.twitter.com/en/portal/projects-and-apps). Once you have the account you need to generate the following:

``` YML
twitter-stream-api:
  keys:
    consumer_key: __YOUR CONSUMER KEY__
    consumer_secret: __YOUR CONSUMER SECRET__
    token: __YOUR CONSUMER TOKEN KEY__
    token_secret: __YOUR CONSUMER TOKEN SECRET__
```

### Solace connection configuration

You will need either a [Solace Cloud](https://solace.com/products/event-broker/cloud/) account, or a [Solace PubSub+ broker](https://solace.com/) you can publish to. [Standard Edition](https://products.solace.com/download/PUBSUB_DOCKER_STAND) is free and dockerized.

I stole the publisher code from their [Node.js Sample Code](https://solace.com/samples/solace-samples-nodejs/):

``` YML
solclientjs:
  host: ws://localhost:8008
  vpn: mysolacevpn
  user: koverton
  password: $uper$ecret
  sendto: your/destination/topic
```

## Node.js Dependencies

This package uses the following npm packages:

- [twitter-stream-api](https://www.npmjs.com/package/twitter-stream-api) : This is twitter's node.js streaming API
- [solclientjs](https://www.npmjs.com/package/solclientjs) : this is Solace's node.js pub/sub streaming API
- [js-yaml](https://www.npmjs.com/package/js-yaml) : not critical, just a convenient way to express configurations for the two streaming APIs while keeping the separation clear
