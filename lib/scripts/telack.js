// Description
//   A Hubot script for telack
//
// Configuration:
//   HUBOT_TELACK_ROOM
//   HUBOT_TELACK_TELACKBOT
//   HUBOT_TELACK_GOOGLE_EMAIL
//   HUBOT_TELACK_GOOGLE_KEY
//   HUBOT_TELACK_GOOGLE_SHEET_KEY
//
// Commands:
//   hubot [telack] get <number> <address> - get address
//   hubot [telack] list - list addresses
//   hubot [telack] set <number> - set address
//
// Author:
//   bouzuya <m@bouzuya.net>
//
var Promise, config, googleSheets, parseConfig;

googleSheets = require('google-sheets-api');

parseConfig = require('hubot-config');

Promise = require('es6-promise').Promise;

config = parseConfig('telack', {
  googleEmail: null,
  googleKey: null,
  googleSheetKey: null,
  room: null,
  telackbot: false
});

module.exports = function(robot) {
  var PREFIX, ROOM, addresses, load, loaded, save;
  ROOM = config.room;
  PREFIX = config.telackbot ? '' : 'telack ';
  loaded = false;
  addresses = [];
  save = function() {
    var client, email, key, sheetKey, spreadsheet;
    email = config.googleEmail;
    key = JSON.parse(config.googleKey);
    sheetKey = config.googleSheetKey;
    client = googleSheets({
      email: email,
      key: key
    });
    spreadsheet = client.getSpreadsheet(sheetKey);
    return spreadsheet.getWorksheetIds().then(function(worksheetIds) {
      return spreadsheet.getWorksheet(worksheetIds[0]);
    }).then(function(worksheet) {
      return addresses.reduce(function(promise, arg, index) {
        var address, number;
        number = arg.number, address = arg.address;
        return promise.then(function() {
          return worksheet.setValue({
            row: index + 1,
            col: 1,
            value: "'" + number
          });
        }).then(function() {
          return worksheet.setValue({
            row: index + 1,
            col: 2,
            value: address
          });
        });
      }, Promise.resolve());
    });
  };
  load = function() {
    var client, email, key, sheetKey, spreadsheet;
    email = config.googleEmail;
    key = JSON.parse(config.googleKey);
    sheetKey = config.googleSheetKey;
    client = googleSheets({
      email: email,
      key: key
    });
    spreadsheet = client.getSpreadsheet(sheetKey);
    return spreadsheet.getWorksheetIds().then(function(worksheetIds) {
      return spreadsheet.getWorksheet(worksheetIds[0]);
    }).then(function(worksheet) {
      return worksheet.getCells();
    }).then(function(cells) {
      var _, ads, v;
      ads = cells.reduce(function(addresses, i) {
        var address, ref;
        address = (ref = addresses[i.row]) != null ? ref : {};
        address[i.col === 1 ? 'number' : 'address'] = i.value;
        addresses[i.row] = address;
        return addresses;
      }, {});
      addresses = (function() {
        var results;
        results = [];
        for (_ in ads) {
          v = ads[_];
          results.push(v);
        }
        return results;
      })();
      loaded = true;
      return robot.messageRoom(ROOM, 'OK. loaded.');
    });
  };
  robot.router.post('/hubot/telack/call', function(req, res) {
    var address, number, ref;
    if (!loaded) {
      return;
    }
    number = req.body.number;
    address = addresses.filter(function(i) {
      return i.number === number;
    })[0];
    robot.messageRoom(ROOM, ":telephone_receiver: Prrrrr!!!!\n" + number + " " + ((ref = address != null ? address.address : void 0) != null ? ref : ''));
    return res.send('OK');
  });
  robot.respond(new RegExp(PREFIX + 'get (\\d+)$'), function(res) {
    var _, address, number, ref, ref1;
    if (!loaded) {
      return;
    }
    ref = res.match, _ = ref[0], number = ref[1];
    address = addresses.filter(function(i) {
      return i.number === number;
    })[0];
    return res.send(number + " " + ((ref1 = address != null ? address.address : void 0) != null ? ref1 : ''));
  });
  robot.respond(new RegExp(PREFIX + 'list$'), function(res) {
    var messages;
    if (!loaded) {
      return;
    }
    messages = addresses.map(function(arg) {
      var address, number;
      number = arg.number, address = arg.address;
      return number + " " + address;
    });
    return res.send(messages.join('\n'));
  });
  robot.respond(new RegExp(PREFIX + 'set (\\d+)\\s*(.*)$'), function(res) {
    var _, address, data, number, ref;
    if (!loaded) {
      return;
    }
    res.send('OK. updating...');
    ref = res.match, _ = ref[0], number = ref[1], address = ref[2];
    if ((address != null ? address.length : void 0) > 0) {
      data = addresses.filter(function(i) {
        return i.number === number;
      })[0];
      if (data != null) {
        data.address = address;
      } else {
        addresses.push({
          number: number,
          address: address
        });
      }
    } else {
      addresses = addresses.filter(function(i) {
        return i.number !== number;
      })[0];
    }
    return save().then(function() {
      return res.send('OK. updated.');
    });
  });
  return load();
};
