# Description
#   A Hubot script for telack
#
# Configuration:
#   HUBOT_TELACK_ROOM
#   HUBOT_TELACK_TELACKBOT
#   HUBOT_TELACK_GOOGLE_EMAIL
#   HUBOT_TELACK_GOOGLE_KEY
#   HUBOT_TELACK_GOOGLE_SHEET_KEY
#
# Commands:
#   hubot [telack] get <number> <address> - get address
#   hubot [telack] list - list addresses
#   hubot [telack] set <number> - set address
#
# Author:
#   bouzuya <m@bouzuya.net>
#
googleSheets = require 'google-sheets-api'
parseConfig = require 'hubot-config'
{Promise} = require 'es6-promise'

config = parseConfig 'telack',
  googleEmail: null
  googleKey: null
  googleSheetKey: null
  room: null
  telackbot: false

module.exports = (robot) ->
  ROOM = config.room
  PREFIX = if config.telackbot then '' else 'telack '
  loaded = false
  addresses = []

  save = ->
    email = config.googleEmail
    key = JSON.parse config.googleKey
    sheetKey = config.googleSheetKey
    client = googleSheets { email, key }
    spreadsheet = client.getSpreadsheet(sheetKey)
    spreadsheet.getWorksheetIds()
    .then (worksheetIds) ->
      spreadsheet.getWorksheet(worksheetIds[0])
    .then (worksheet) ->
      addresses.reduce (promise, { number, address }, index) ->
        promise
        .then ->
          worksheet.setValue({ row: index + 1, col: 1, value: "'" + number })
        .then ->
          worksheet.setValue({ row: index + 1, col: 2, value: address })
      , Promise.resolve()

  load = ->
    email = config.googleEmail
    key = JSON.parse config.googleKey
    sheetKey = config.googleSheetKey
    client = googleSheets { email, key }
    spreadsheet = client.getSpreadsheet(sheetKey)
    spreadsheet.getWorksheetIds()
    .then (worksheetIds) ->
      spreadsheet.getWorksheet(worksheetIds[0])
    .then (worksheet) ->
      worksheet.getCells()
    .then (cells) ->
      ads = cells.reduce((addresses, i) ->
        address = addresses[i.row] ? {}
        address[if i.col is 1 then 'number' else 'address'] = i.value
        addresses[i.row] = address
        addresses
      , {})
      addresses = (v for _, v of ads)
      loaded = true
      robot.messageRoom ROOM, 'OK. loaded.'

  robot.router.post '/hubot/telack/call', (req, res) ->
    return unless loaded
    number = req.body.number
    address = addresses.filter((i) -> i.number is number)[0]
    robot.messageRoom ROOM, """
      :telephone_receiver: Prrrrr!!!!
      #{number} #{address?.address ? ''}
    """
    res.send 'OK'

  robot.respond new RegExp(PREFIX + 'get (\\d+)$'), (res) ->
    return unless loaded
    [_, number] = res.match
    address = addresses.filter((i) -> i.number is number)[0]
    res.send "#{number} #{address?.address ? ''}"

  robot.respond new RegExp(PREFIX + 'list$'), (res) ->
    return unless loaded
    messages = addresses.map ({ number, address }) ->
      "#{number} #{address}"
    res.send messages.join('\n')

  robot.respond new RegExp(PREFIX + 'set (\\d+)\\s*(.*)$'), (res) ->
    return unless loaded
    res.send 'OK. updating...'
    [_, number, address] = res.match
    if address?.length > 0
      data = addresses.filter((i) -> i.number is number)[0]
      if data?
        data.address = address
      else
        addresses.push { number, address }
    else
      addresses = addresses.filter((i) -> i.number isnt number)[0]
    save()
    .then ->
      res.send 'OK. updated.'

  load()
