function ab2str(e) {
  return btoa(String.fromCharCode(...new Uint8Array(e)))
}
function str2ab(e) {
  return Uint8Array.from([...atob(e)].map(e => e.charCodeAt())).buffer
}
function formatOutput(output) {
  let obj = {}

  if (Object.entries(output).length === 0) {
    return obj
  }

  Object.entries(output).forEach(entry => {
    if (typeof entry[1] === 'object') {
      entry[1] instanceof ArrayBuffer
        ? (obj[entry[0]] = 'ArrayBuffer' + ab2str(entry[1]))
        : (obj[entry[0]] = formatOutput(entry[1]))
    } else {
      obj[entry[0]] = entry[1]
    }
  })

  return obj
}
function formatInput(input) {
  let obj = {}

  Object.entries(input).forEach(entry => {
    if (typeof entry[1] === 'object') {
      obj[entry[0]] = formatInput(entry[1])
    } else if (typeof entry[1] === 'string' && /^(ArrayBuffer)/.test(entry[1])) {
      obj[entry[0]] = str2ab(entry[1].replace('ArrayBuffer', ''))
    } else {
      obj[entry[0]] = entry[1]
    }
  })

  return obj
}

function SignalProtocolStore() {
  this.store = {}
}

SignalProtocolStore.prototype = {
  Direction: {
    SENDING: 1,
    RECEIVING: 2,
  },

  getIdentityKeyPair: function() {
    return Promise.resolve(this.get('identityKey'))
  },
  getLocalRegistrationId: function() {
    return Promise.resolve(this.get('registrationId'))
  },
  put: function(key, value) {
    if (key === undefined || value === undefined || key === null || value === null)
      throw new Error('Tried to store undefined/null')
    this.store[key] = value
  },
  get: function(key, defaultValue) {
    if (key === null || key === undefined)
      throw new Error('Tried to get value for undefined/null key')
    if (key in this.store) {
      return this.store[key]
    } else {
      return defaultValue
    }
  },
  remove: function(key) {
    if (key === null || key === undefined)
      throw new Error('Tried to remove value for undefined/null key')
    delete this.store[key]
  },

  isTrustedIdentity: function(identifier, identityKey, direction) {
    if (identifier === null || identifier === undefined) {
      throw new Error('tried to check identity key for undefined/null key')
    }
    if (!(identityKey instanceof ArrayBuffer)) {
      throw new Error('Expected identityKey to be an ArrayBuffer')
    }
    var trusted = this.get('identityKey' + identifier)
    if (trusted === undefined) {
      return Promise.resolve(true)
    }
    return Promise.resolve(util.toString(identityKey) === util.toString(trusted))
  },
  loadIdentityKey: function(identifier) {
    if (identifier === null || identifier === undefined)
      throw new Error('Tried to get identity key for undefined/null key')
    return Promise.resolve(this.get('identityKey' + identifier))
  },
  saveIdentity: function(identifier, identityKey) {
    if (identifier === null || identifier === undefined)
      throw new Error('Tried to put identity key for undefined/null key')

    var address = new libsignal.SignalProtocolAddress.fromString(identifier)

    var existing = this.get('identityKey' + address.getName())
    this.put('identityKey' + address.getName(), identityKey)

    if (existing && util.toString(identityKey) !== util.toString(existing)) {
      return Promise.resolve(true)
    } else {
      return Promise.resolve(false)
    }
  },

  /* Returns a prekeypair object or undefined */
  loadPreKey: function(keyId) {
    var res = this.get('25519KeypreKey' + keyId)
    if (res !== undefined) {
      res = { pubKey: res.pubKey, privKey: res.privKey }
    }
    return Promise.resolve(res)
  },
  storePreKey: function(keyId, keyPair) {
    return Promise.resolve(this.put('25519KeypreKey' + keyId, keyPair))
  },
  removePreKey: function(keyId) {
    return Promise.resolve(this.remove('25519KeypreKey' + keyId))
  },

  /* Returns a signed keypair object or undefined */
  loadSignedPreKey: function(keyId) {
    var res = this.get('25519KeysignedKey' + keyId)
    if (res !== undefined) {
      res = { pubKey: res.pubKey, privKey: res.privKey }
    }
    return Promise.resolve(res)
  },
  storeSignedPreKey: function(keyId, keyPair) {
    return Promise.resolve(this.put('25519KeysignedKey' + keyId, keyPair))
  },
  removeSignedPreKey: function(keyId) {
    return Promise.resolve(this.remove('25519KeysignedKey' + keyId))
  },

  loadSession: function(identifier) {
    return Promise.resolve(this.get('session' + identifier))
  },
  storeSession: function(identifier, record) {
    return Promise.resolve(this.put('session' + identifier, record))
  },
  removeSession: function(identifier) {
    return Promise.resolve(this.remove('session' + identifier))
  },
  removeAllSessions: function(identifier) {
    for (var id in this.store) {
      if (id.startsWith('session' + identifier)) {
        delete this.store[id]
      }
    }
    return Promise.resolve()
  },
}

function postMessage(msg) {
  const x = JSON.stringify({
    msg: msg,
    store: btoa(JSON.stringify(formatOutput(window.SignalStore.store))),
  })

  window.ReactNativeWebView.postMessage(x)
}

function arrayBufferToBase64(buffer) {
  var binary = ''
  var bytes = new Uint8Array(buffer)
  var len = bytes.byteLength
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

function base64ToArrayBuffer(base64) {
  var binary_string = window.atob(base64)
  var len = binary_string.length
  var bytes = new Uint8Array(len)
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i)
  }
  return bytes.buffer
}

function sendRequest(url, reqObj) {
  return fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reqObj),
  })
    .then(res => {
      return res.json()
    })
    .catch(err => {
      console.log(err)
    })
}

// Util import from src/helpers.js
var util = (function() {
  'use strict'

  var StaticArrayBufferProto = new ArrayBuffer().__proto__

  return {
    toString: function(thing) {
      if (typeof thing == 'string') {
        return thing
      }
      return new dcodeIO.ByteBuffer.wrap(thing).toString('binary')
    },
    toArrayBuffer: function(thing) {
      if (thing === undefined) {
        return undefined
      }
      if (thing === Object(thing)) {
        if (thing.__proto__ == StaticArrayBufferProto) {
          return thing
        }
      }

      var str
      if (typeof thing == 'string') {
        str = thing
      } else {
        throw new Error(
          'Tried to convert a non-string of type ' + typeof thing + ' to an array buffer',
        )
      }
      return new dcodeIO.ByteBuffer.wrap(thing, 'binary').toArrayBuffer()
    },
    isEqual: function(a, b) {
      // TODO: Special-case arraybuffers, etc
      if (a === undefined || b === undefined) {
        return false
      }
      a = util.toString(a)
      b = util.toString(b)
      var maxLength = Math.max(a.length, b.length)
      if (maxLength < 5) {
        throw new Error('a/b compare too short')
      }
      return (
        a.substring(0, Math.min(maxLength, a.length)) ==
        b.substring(0, Math.min(maxLength, b.length))
      )
    },
  }
})()

window.util = util
window.arrBuffToBase64 = arrayBufferToBase64
window.base64ToArrBuff = base64ToArrayBuffer
window.sendRequest = sendRequest

window.SignalStore = new SignalProtocolStore()
