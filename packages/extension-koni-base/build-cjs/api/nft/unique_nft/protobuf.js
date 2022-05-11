"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deserializeNft = void 0;

var _protobufjs = require("protobufjs");

// Copyright 2019-2022 @polkadot/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0
function defineMessage(schema) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return _protobufjs.Root.fromJSON(JSON.parse(schema));
  } catch (e) {
    console.log('Error parsing JSON schema', e);
    return null;
  }
}

function convertEnumToString(value, key, NFTMeta, locale) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  let result = value;

  try {
    var _NFTMeta$fields$key, _NFTMeta$fields$key$r;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
    const options = NFTMeta === null || NFTMeta === void 0 ? void 0 : (_NFTMeta$fields$key = NFTMeta.fields[key]) === null || _NFTMeta$fields$key === void 0 ? void 0 : (_NFTMeta$fields$key$r = _NFTMeta$fields$key.resolvedType) === null || _NFTMeta$fields$key$r === void 0 ? void 0 : _NFTMeta$fields$key$r.options; // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment

    const valueJsonComment = options[value]; // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-assignment

    const translationObject = JSON.parse(valueJsonComment); // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access

    if (translationObject && translationObject[locale]) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
      result = translationObject[locale];
    }
  } catch (e) {
    console.log('Error parsing schema when trying to convert enum to string: ', e);
  } // eslint-disable-next-line @typescript-eslint/no-unsafe-return


  return result;
}

const deserializeNft = (schema, buffer, locale) => {
  const root = defineMessage(schema);

  if (root === null) {
    return root;
  } // Obtain the message type


  const NFTMeta = root.lookupType('onChainMetaData.NFTMeta'); // Decode a Uint8Array (browser) or Buffer (node) to a message

  const message = NFTMeta.decode(buffer); // Maybe convert the message back to a plain object

  const objectItem = NFTMeta.toObject(message, {
    arrays: true,
    // populates empty arrays (repeated fields) even if defaults=false
    bytes: String,
    // bytes as base64 encoded strings
    defaults: true,
    // includes default values
    enums: String,
    // enums as string names
    longs: String,
    // longs as strings (requires long.js)
    objects: true,
    // populates empty objects (map fields) even if defaults=false
    oneofs: true
  });

  for (const key in objectItem) {
    var _NFTMeta$fields$key2, _NFTMeta$fields$key2$, _NFTMeta$fields$key3, _NFTMeta$fields$key3$;

    // eslint-disable-next-line @typescript-eslint/ban-types
    if (NFTMeta !== null && NFTMeta !== void 0 && (_NFTMeta$fields$key2 = NFTMeta.fields[key]) !== null && _NFTMeta$fields$key2 !== void 0 && (_NFTMeta$fields$key2$ = _NFTMeta$fields$key2.resolvedType) !== null && _NFTMeta$fields$key2$ !== void 0 && _NFTMeta$fields$key2$.options && Object.keys(NFTMeta === null || NFTMeta === void 0 ? void 0 : (_NFTMeta$fields$key3 = NFTMeta.fields[key]) === null || _NFTMeta$fields$key3 === void 0 ? void 0 : (_NFTMeta$fields$key3$ = _NFTMeta$fields$key3.resolvedType) === null || _NFTMeta$fields$key3$ === void 0 ? void 0 : _NFTMeta$fields$key3$.options).length > 0) {
      if (Array.isArray(objectItem[key])) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const item = objectItem[key];
        objectItem[key] = []; // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access

        item.forEach(value => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
          objectItem[key].push(convertEnumToString(value, key, NFTMeta, locale));
        });
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
        objectItem[key] = convertEnumToString(objectItem[key], key, NFTMeta, locale);
      }
    }
  }

  return objectItem;
};

exports.deserializeNft = deserializeNft;