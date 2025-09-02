import { pbkdf2Sync } from 'crypto';

export const paddingBytesToRemoveFromIV = [0x0e, 0x0d, 0x0f];

export const constants = {
  iterations : 7,
  hashAlgorithm: 'md5',
  keyLength: 32,
  ivLength: 16,
  encoding: 'utf-8',
  encodeEncrypted: 'base64',
  encryptAlgorithm:'aes-256-cbc',
  fixedIVIV: 'fl1',
  fixedIVKey: 'po9',
  defaultAppname: 'meta',
  versionNumber: 1

}

export function deriveKeyAndIV(appname,iv, timestamp = undefined) {
  let keyText = `${appname}` 
  if (timestamp !== undefined){
    keyText = `${appname}${timestamp}` 
  }
  let keyBuffer = Buffer.from(keyText, constants.encoding);
  const filteredKeyBytes = Array.from(keyBuffer).filter(byte => byte !== 0x01);
  const key = Buffer.from(filteredKeyBytes);
  
  const salt = Buffer.from(appname, constants.encoding);
  
  const derivedKey = pbkdf2Sync(key, salt, constants.iterations, constants.keyLength, constants.hashAlgorithm);
  const derivedIV = pbkdf2Sync(iv, salt, constants.iterations, constants.ivLength, constants.hashAlgorithm);
  
  return { derivedKey, derivedIV, key };
}
