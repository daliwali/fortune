import http from 'http';
import Fortune from '../lib';

const PORT = 1337;

var App = new Fortune();

App.resource('user', {
  name: String,
  age: {type: Number, min: 0, max: 100},
  friends: {link: 'user', inverse: 'friends'},
  pets: {link: ['animal'], inverse: 'owner'}
}).after(function () {
  this.timestamp = Date.now();
  return Promise.resolve(this);
});

App.resource('animal', {
  name: String,
  owner: {link: 'user', inverse: 'pets'}
}).after(function () {
  this.a = 123;
  return this;
});

App.init().then(() => {
  //http.createServer(Fortune.Net.requestListener.bind(App)).listen(PORT);
  //console.log(`Listening on port ${PORT}...`);

  App.request({
    action: 'create',
    type: 'user',
    //ids: [1, 1, 2],
    //relatedField: 'pets',
    include: [['pets'], ['pets', 'owner']],
    serializerInput: 'application/vnd.api+json',
    serializerOutput: 'application/vnd.api+json'
  }).then((result) => {
    console.log(JSON.stringify(result, null, 2));
    //console.log(result);
  }, (error) => {
    console.log('FAIL');
    console.log(error);
  });
});
