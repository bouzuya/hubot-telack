# hubot-telack

A Hubot script for [telack][]

## Installation

    $ npm install https://github.com/bouzuya/hubot-telack/archive/master.tar.gz

or

    $ npm install https://github.com/bouzuya/hubot-telack/archive/{VERSION}.tar.gz

## Example

    (set address)
    bouzuya> hubot telack set 09012345678 山田さん
      hubot> OK. updated.

    (get address),
    bouzuya> hubot telack get 09012345678
      hubot> 09012345678 山田さん

    (list addresses)
    bouzuya> hubot telack list
      hubot> 09012345678 山田さん
             09087654321 田中さん

    (received)
      hubot> :telephone_receiver: Prrrrr!!!!
             09012345678 山田さん

## Configuration

See [`src/scripts/telack.coffee`](src/scripts/telack.coffee).

## Development

See `npm run`

## License

[MIT](LICENSE)

## Author

[bouzuya][user] &lt;[m@bouzuya.net][mail]&gt; ([http://bouzuya.net][url])

## Badges

[![Build Status][travis-badge]][travis]
[![Dependencies status][david-dm-badge]][david-dm]
[![Coverage Status][coveralls-badge]][coveralls]

[telack]: https://github.com/faithcreates-tuesday/telack
[travis]: https://travis-ci.org/bouzuya/hubot-telack
[travis-badge]: https://travis-ci.org/bouzuya/hubot-telack.svg?branch=master
[david-dm]: https://david-dm.org/bouzuya/hubot-telack
[david-dm-badge]: https://david-dm.org/bouzuya/hubot-telack.png
[coveralls]: https://coveralls.io/r/bouzuya/hubot-telack
[coveralls-badge]: https://img.shields.io/coveralls/bouzuya/hubot-telack.svg
[user]: https://github.com/bouzuya
[mail]: mailto:m@bouzuya.net
[url]: http://bouzuya.net
