var test = require('tape')
var fs = require('fs')
var asn1 = require('parse-asn1/asn1')
var parseKeys = require('parse-asn1')
var crt = require('browserify-rsa')
var crypto = require('crypto')
var fixtures = require('./fixtures')

function isNode10 () {
  return process.version && process.version.split('.').length === 3 && parseInt(process.version.split('.')[1], 10) <= 10
}
var nodeCrypto = require('crypto')
var myCrypto = require('../browser')
function testIt (keys, message, scheme) {
  var pub = keys.public
  var priv = keys.private
  test(message.toString(), function (t) {
    t.plan(4)
    var mySign = myCrypto.createSign(scheme)
    var nodeSign = nodeCrypto.createSign(scheme)
    var mySig = mySign.update(message).sign(priv)
    var nodeSig = nodeSign.update(message).sign(priv)
    t.equals(mySig.length, nodeSig.length, 'correct length')
    t.equals(mySig.toString('hex'), nodeSig.toString('hex'), 'equal sigs')
    var myVer = myCrypto.createVerify(scheme)
    var nodeVer = nodeCrypto.createVerify(scheme)
    t.ok(nodeVer.update(message).verify(pub, mySig), 'node validate my sig')
    t.ok(myVer.update(message).verify(pub, nodeSig), 'me validate node sig')
  })
}
function ectestIt (keys, message, scheme) {
  var pub = keys.public
  var priv = keys.private
  test(message.toString(), function (t) {
    t.plan(3)

    var nodeSign = nodeCrypto.createSign(scheme)
    var mySign = myCrypto.createSign(scheme)

    var mySig = mySign.update(message).sign(priv)
    var nodeSig = nodeSign.update(message).sign(priv)
    t.notEqual(mySig.toString('hex'), nodeSig.toString('hex'), 'not equal sigs')
    var myVer = myCrypto.createVerify(scheme)
    var nodeVer = nodeCrypto.createVerify(scheme)
    t.ok(nodeVer.update(message).verify(pub, mySig), 'node validate my sig')
    t.ok(myVer.update(message).verify(pub, nodeSig), 'me validate node sig')
  })
}

ectestIt(fixtures.dsa, new Buffer('dsa with 1024 keys'), 'DSA')
ectestIt(fixtures.dsa2, new Buffer('dsa with 2048 keys'), 'DSA-SHA1')
testIt(fixtures.rsa1024, new Buffer('md5 with 1024 keys'), 'RSA-MD5')
ectestIt(fixtures.ec, new Buffer('ecdsa with sha1'), 'ecdsa-with-SHA1')
ectestIt(fixtures.ec192, new Buffer('ecdsa with p192 key with sha1'), 'ecdsa-with-SHA1')
ectestIt(fixtures.ec224, new Buffer('ecdsa with p224 key with sha1'), 'ecdsa-with-SHA1')
ectestIt(fixtures.ec256, new Buffer('ecdsa with p256 key with sha1'), 'ecdsa-with-SHA1')
testIt(fixtures.rsa1024, new Buffer('md5 with 1024 keys'), 'RSA-MD5')
testIt(fixtures.rsa2028, new Buffer('md5 with 2028 keys'), 'RSA-MD5')
testIt(fixtures.nonrsa1024, new Buffer('md5 with 1024 keys non-rsa key'), 'RSA-MD5')
testIt(fixtures.rsa1024, new Buffer('rmd160 with 2028 keys'), 'RSA-RIPEMD160')
testIt(fixtures.rsa2028, new Buffer('rmd160 with 1024 keys'), 'RSA-RIPEMD160')
testIt(fixtures.nonrsa1024, new Buffer('rmd160 with 1024 keys non-rsa key'), 'RSA-RIPEMD160')
testIt(fixtures.rsa1024, new Buffer('sha1 with 1024 keys'), 'RSA-SHA1')
testIt(fixtures.rsa2028, new Buffer('sha1 with 2028 keys'), 'RSA-SHA1')
testIt(fixtures.nonrsa1024, new Buffer('sha1 with 1024 keys non-rsa key'), 'RSA-SHA1')
testIt(fixtures.rsa1024, new Buffer('sha224 with 1024 keys'), 'RSA-SHA224')
testIt(fixtures.nonrsa1024, new Buffer('sha224 with 1024 keys non-rsa key'), 'RSA-SHA224')
testIt(fixtures.rsa2028, new Buffer('sha224 with 2028 keys'), 'RSA-SHA224')
testIt(fixtures.rsa1024, new Buffer('SHA256 with 1024 keys'), 'RSA-SHA256')
testIt(fixtures.nonrsa1024, new Buffer('sha256 with 1024 keys non-rsa key'), 'RSA-SHA256')
testIt(fixtures.rsa2028, new Buffer('SHA256 with 2028 keys'), 'RSA-SHA256')
testIt(fixtures.rsa1024, new Buffer('SHA384 with 1024 keys'), 'RSA-SHA384')
testIt(fixtures.nonrsa1024, new Buffer('sha384 with 1024 keys non-rsa key'), 'RSA-SHA384')
testIt(fixtures.rsa2028, new Buffer('SHA384 with 2028 keys'), 'RSA-SHA384')
testIt(fixtures.rsa1024, new Buffer('SHA512 with 1024 keys'), 'RSA-SHA512')
testIt(fixtures.nonrsa1024, new Buffer('sha512 with 1024 keys non-rsa key'), 'RSA-SHA512')
testIt(fixtures.rsa2028, new Buffer('SHA512 with 2028 keys'), 'RSA-SHA512')
if (!isNode10()) {
  ectestIt(fixtures.ecpass, new Buffer('ecdsa with password'), 'ecdsa-with-SHA1')
  ectestIt(fixtures.dsapass, new Buffer('dsa with 1024 keys and a password'), 'DSA-SHA')
  ectestIt(fixtures.dsapass2, new Buffer('dsa with 1024 keys and a password varient'), 'DSA-SHA')
  testIt(fixtures.rsapass, new Buffer('sha1 with 1024 keys and password, varient'), 'RSA-SHA1')
  testIt(fixtures.rsapass2, new Buffer('sha1 with 2024 keys and password, varient'), 'RSA-SHA1')
  testIt(fixtures.rsapass, new Buffer('sha224 with 1024 keys and password, varient'), 'RSA-SHA224')
  testIt(fixtures.rsapass2, new Buffer('sha224 with 2024 keys and password, varient'), 'RSA-SHA224')
  testIt(fixtures.rsapass, new Buffer('sha256 with 1024 keys and password, varient'), 'RSA-SHA256')
  testIt(fixtures.rsapass2, new Buffer('sha256 with 2024 keys and password, varient'), 'RSA-SHA256')
  testIt(fixtures.rsapass, new Buffer('sha384 with 1024 keys and password, varient'), 'RSA-SHA384')
  testIt(fixtures.rsapass2, new Buffer('sha384 with 2024 keys and password, varient'), 'RSA-SHA384')
  testIt(fixtures.rsapass, new Buffer('sha512 with 1024 keys and password, varient'), 'RSA-SHA512')
  testIt(fixtures.rsapass2, new Buffer('sha512 with 2024 keys and password, varient'), 'RSA-SHA512')
  testIt(fixtures.rsapass, new Buffer('rmd160 with 1024 keys and password, varient'), 'RSA-RIPEMD160')
  testIt(fixtures.rsapass2, new Buffer('rmd160 with 2024 keys and password, varient'), 'RSA-RIPEMD160')
  testIt(fixtures.rsapass, new Buffer('md5 with 1024 keys and password, varient'), 'RSA-MD5')
  testIt(fixtures.rsapass2, new Buffer('md5 with 2024 keys and password, varient'), 'RSA-MD5')
  testIt(fixtures.pass1024, new Buffer('sha1 with 1024 keys and password'), 'RSA-SHA1')
  testIt(fixtures.pass1024, new Buffer('sha224 with 1024 keys and password'), 'RSA-SHA224')
  testIt(fixtures.pass1024, new Buffer('sha256 with 1024 keys and password'), 'RSA-SHA256')
  testIt(fixtures.pass1024, new Buffer('sha384 with 1024 keys and password'), 'RSA-SHA384')
  testIt(fixtures.pass1024, new Buffer('sha512 with 1024 keys and password'), 'RSA-SHA512')
  testIt(fixtures.pass1024, new Buffer('rmd160 with 1024 keys and password'), 'RSA-RIPEMD160')
  testIt(fixtures.pass1024, new Buffer('md5 with 1024 keys and password'), 'RSA-MD5')
}
function kvector (algo, r, s, t, key, msg) {
  t.plan(2)
  var sig = myCrypto.createSign(algo).update(msg).sign(key)
  var rs = asn1.signature.decode(sig, 'der')
  t.equals(rs.r.toString(16), r.toLowerCase(), 'r')
  t.equals(rs.s.toString(16), s.toLowerCase(), 's')
}
var vectors = [
  {
    algo: 'dsa-sha1',
    r: '2E1A0C2562B2912CAAF89186FB0F42001585DA55',
    s: '29EFB6B0AFF2D7A68EB70CA313022253B9A88DF5',
    key: fixtures.vector,
    msg: 'sample'
  },
  {
    algo: 'dsa-sha1',
    r: '42AB2052FD43E123F0607F115052A67DCD9C5C77',
    s: '183916B0230D45B9931491D4C6B0BD2FB4AAF088',
    key: fixtures.vector,
    msg: 'test'
  },
  {
    algo: 'dsa-sha224',
    r: '4BC3B686AEA70145856814A6F1BB53346F02101E',
    s: '410697B92295D994D21EDD2F4ADA85566F6F94C1',
    key: fixtures.vector,
    msg: 'sample'
  },
  {
    algo: 'dsa-sha224',
    r: '6868E9964E36C1689F6037F91F28D5F2C30610F2',
    s: '49CEC3ACDC83018C5BD2674ECAAD35B8CD22940F',
    key: fixtures.vector,
    msg: 'test'
  },
  {
    algo: 'dsa-sha256',
    r: '81F2F5850BE5BC123C43F71A3033E9384611C545',
    s: '4CDD914B65EB6C66A8AAAD27299BEE6B035F5E89',
    key: fixtures.vector,
    msg: 'sample'
  },
  {
    algo: 'dsa-sha256',
    r: '22518C127299B0F6FDC9872B282B9E70D0790812',
    s: '6837EC18F150D55DE95B5E29BE7AF5D01E4FE160',
    key: fixtures.vector,
    msg: 'test'
  },
   {
    algo: 'dsa-sha384',
    r: '7F2108557EE0E3921BC1774F1CA9B410B4CE65A',
    s: '54DF70456C86FAC10FAB47C1949AB83F2C6F7595',
    key: fixtures.vector,
    msg: 'sample'
  },
  {
    algo: 'dsa-sha384',
    r: '854CF929B58D73C3CBFDC421E8D5430CD6DB5E66',
    s: '91D0E0F53E22F898D158380676A871A157CDA622',
    key: fixtures.vector,
    msg: 'test'
  },
   {
    algo: 'dsa-sha512',
    r: '16C3491F9B8C3FBBDD5E7A7B667057F0D8EE8E1B',
    s: '2C36A127A7B89EDBB72E4FFBC71DABC7D4FC69C',
    key: fixtures.vector,
    msg: 'sample'
  },
  {
    algo: 'dsa-sha512',
    r: '8EA47E475BA8AC6F2D821DA3BD212D11A3DEB9A0',
    s: '7C670C7AD72B6C050C109E1790008097125433E8',
    key: fixtures.vector,
    msg: 'test'
  },
  {
    algo: 'dsa-sha1',
    r: '3A1B2DBD7489D6ED7E608FD036C83AF396E290DBD602408E8677DAABD6E7445A',
    s: 'D26FCBA19FA3E3058FFC02CA1596CDBB6E0D20CB37B06054F7E36DED0CDBBCCF',
    key: fixtures.vector2,
    msg: 'sample'
  },
  {
    algo: 'dsa-sha1',
    r: 'C18270A93CFC6063F57A4DFA86024F700D980E4CF4E2CB65A504397273D98EA0',
    s: '414F22E5F31A8B6D33295C7539C1C1BA3A6160D7D68D50AC0D3A5BEAC2884FAA',
    key: fixtures.vector2,
    msg: 'test'
  },
  {
    algo: 'dsa-sha224',
    r: 'DC9F4DEADA8D8FF588E98FED0AB690FFCE858DC8C79376450EB6B76C24537E2C',
    s: 'A65A9C3BC7BABE286B195D5DA68616DA8D47FA0097F36DD19F517327DC848CEC',
    key: fixtures.vector2,
    msg: 'sample'
  },
  {
    algo: 'dsa-sha224',
    r: '272ABA31572F6CC55E30BF616B7A265312018DD325BE031BE0CC82AA17870EA3',
    s: 'E9CC286A52CCE201586722D36D1E917EB96A4EBDB47932F9576AC645B3A60806',
    key: fixtures.vector2,
    msg: 'test'
  },
  {
    algo: 'dsa-sha256',
    r: 'EACE8BDBBE353C432A795D9EC556C6D021F7A03F42C36E9BC87E4AC7932CC809',
    s: '7081E175455F9247B812B74583E9E94F9EA79BD640DC962533B0680793A38D53',
    key: fixtures.vector2,
    msg: 'sample'
  },
  {
    algo: 'dsa-sha256',
    r: '8190012A1969F9957D56FCCAAD223186F423398D58EF5B3CEFD5A4146A4476F0',
    s: '7452A53F7075D417B4B013B278D1BB8BBD21863F5E7B1CEE679CF2188E1AB19E',
    key: fixtures.vector2,
    msg: 'test'
  },
  {
    algo: 'dsa-sha384',
    r: 'B2DA945E91858834FD9BF616EBAC151EDBC4B45D27D0DD4A7F6A22739F45C00B',
    s: '19048B63D9FD6BCA1D9BAE3664E1BCB97F7276C306130969F63F38FA8319021B',
    key: fixtures.vector2,
    msg: 'sample'
  },
  {
    algo: 'dsa-sha384',
    r: '239E66DDBE8F8C230A3D071D601B6FFBDFB5901F94D444C6AF56F732BEB954BE',
    s: '6BD737513D5E72FE85D1C750E0F73921FE299B945AAD1C802F15C26A43D34961',
    key: fixtures.vector2,
    msg: 'test'
  },
  {
    algo: 'dsa-sha512',
    r: '2016ED092DC5FB669B8EFB3D1F31A91EECB199879BE0CF78F02BA062CB4C942E',
    s: 'D0C76F84B5F091E141572A639A4FB8C230807EEA7D55C8A154A224400AFF2351',
    key: fixtures.vector2,
    msg: 'sample'
  },
  {
    algo: 'dsa-sha512',
    r: '89EC4BB1400ECCFF8E7D9AA515CD1DE7803F2DAFF09693EE7FD1353E90A68307',
    s: 'C9F0BDABCC0D880BB137A994CC7F3980CE91CC10FAF529FC46565B15CEA854E1',
    key: fixtures.vector2,
    msg: 'test'
  }
]
test('kvector works', function (t) {
  vectors.forEach(function (vec) {
    t.test('algo: ' + vec.algo + ' key len: ' + vec.key.length + ' msg: ' + vec.msg, function (t) {
      kvector(vec.algo, vec.r, vec.s, t, vec.key, vec.msg)
    })
  })
})

test('reject invalid sigs', function (t) {
  var message = 'a valid message!'
  var hash = Buffer.concat([
    new Buffer('302d300d06096086480165030402040500041c', 'hex'),
    crypto.createHash('sha224').update(message).digest()
  ])
  t.test('I create a valid sig', function (t) {
    t.plan(2)
    var priv = parseKeys(fixtures.rsa1024.private)
    var len = priv.modulus.byteLength()
    var pad = [ 0, 1 ]
    while (hash.length + pad.length + 1 < len) {
      pad.push(0xff)
    }
    pad.push(0x00)
    var i = -1
    while (++i < hash.length) {
      pad.push(hash[i])
    }

    var sign = crt(pad, priv)
    t.ok(nodeCrypto.createVerify('RSA-SHA224')
      .update(message)
      .verify(fixtures.rsa1024.public, sign), 'node accepts it')
    t.ok(myCrypto.createVerify('RSA-SHA224').update(message).verify(fixtures.rsa1024.public, sign), 'I accept it')
  })
  t.test('invalid leading byte', function (t) {
    t.plan(2)
    var priv = parseKeys(fixtures.rsa1024.private)
    var len = priv.modulus.byteLength()
    var pad = [ 0, 2 ]
    while (hash.length + pad.length + 1 < len) {
      pad.push(0xff)
    }
    pad.push(0x00)
    var i = -1
    while (++i < hash.length) {
      pad.push(hash[i])
    }

    var sign = crt(pad, priv)
    t.notOk(nodeCrypto.createVerify('RSA-SHA224')
      .update(message)
      .verify(fixtures.rsa1024.public, sign), 'node rejects it')
    t.notOk(myCrypto.createVerify('RSA-SHA224').update(message).verify(fixtures.rsa1024.public, sign), 'I reject it')
  })

  t.test('invalid ending bytes', function (t) {
    t.plan(2)
    var priv = parseKeys(fixtures.rsa1024.private)
    var len = priv.modulus.byteLength()
    var pad = [ 0, 1 ]
    while (hash.length + pad.length + 1 < len) {
      pad.push(0xff)
    }
    pad.push(0x02)
    var i = -1
    while (++i < hash.length) {
      pad.push(hash[i])
    }

    var sign = crt(pad, priv)
    t.notOk(nodeCrypto.createVerify('RSA-SHA224')
      .update(message)
      .verify(fixtures.rsa1024.public, sign), 'node rejects it')
    t.notOk(myCrypto.createVerify('RSA-SHA224').update(message).verify(fixtures.rsa1024.public, sign), 'I reject it')
  })

  t.test('missing f', function (t) {
    t.plan(2)
    var priv = parseKeys(fixtures.rsa1024.private)
    var len = priv.modulus.byteLength()
    var pad = [ 0, 1 ]
    while (hash.length + pad.length + 2 < len) {
      pad.push(0xff)
    }
    pad.push(0x00)
    var i = -1
    while (++i < hash.length) {
      pad.push(hash[i])
    }

    var sign = crt(pad, priv)
    t.notOk(nodeCrypto.createVerify('RSA-SHA224')
      .update(message)
      .verify(fixtures.rsa1024.public, sign), 'node rejects it')
    t.notOk(myCrypto.createVerify('RSA-SHA224').update(message).verify(fixtures.rsa1024.public, sign), 'I reject it')
  })

  t.test('missing f, extra data', function (t) {
    t.plan(2)
    var priv = parseKeys(fixtures.rsa1024.private)
    var len = priv.modulus.byteLength()
    var pad = [ 0, 1 ]
    while (hash.length + pad.length + 2 < len) {
      pad.push(0xff)
    }
    pad.push(0x00)
    var i = -1
    while (++i < hash.length) {
      pad.push(hash[i])
    }
    pad.push(0)
    var sign = crt(pad, priv)
    t.notOk(nodeCrypto.createVerify('RSA-SHA224')
      .update(message)
      .verify(fixtures.rsa1024.public, sign), 'node rejects it')
    t.notOk(myCrypto.createVerify('RSA-SHA224').update(message).verify(fixtures.rsa1024.public, sign), 'I reject it')
  })

  t.test('in suficent fs', function (t) {
    t.plan(2)
    var priv = parseKeys(fixtures.rsa1024.private)
    var len = priv.modulus.byteLength()
    var pad = [ 0, 1 ]
    var i = 7
    while (i--) {
      pad.push(0xff)
    }
    pad.push(0x00)
    i = -1
    while (++i < hash.length) {
      pad.push(hash[i])
    }
    pad.push(0)
    var sign = crt(pad, priv)
    t.notOk(nodeCrypto.createVerify('RSA-SHA224')
      .update(message)
      .verify(fixtures.rsa1024.public, sign), 'node rejects it')
    t.notOk(myCrypto.createVerify('RSA-SHA224').update(message).verify(fixtures.rsa1024.public, sign), 'I reject it')
  })
})
