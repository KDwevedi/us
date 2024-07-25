import * as crypto from 'crypto';

function base64ToArrayBuffer(base64String) {
  const binaryString = Buffer.from(base64String, 'base64').toString('binary');
  const buffer = new ArrayBuffer(binaryString.length);
  const byteArray = new Uint8Array(buffer);

  for (let i = 0; i < binaryString.length; i++) {
    byteArray[i] = binaryString.charCodeAt(i);
  }

  return buffer;
}

const encode = (data) => {
  const encoder = new TextEncoder();
  return encoder.encode(data);
};

const decode = (bytestream) => {
  const decoder = new TextDecoder();
  return decoder.decode(bytestream);
};

const generateIv = () => {
  return crypto.randomBytes(12);
};

const generateAad = () => {
  return crypto.randomBytes(16);
};

export const pack = (buffer) => {
  return Buffer.from(buffer).toString('base64');
};

export const unpack = (packed) => {
  return new Uint8Array(Buffer.from(packed, 'base64'));
};

const importCryptoKey = (base64Key) => {
  return Buffer.from(base64ToArrayBuffer(base64Key));
};

export const encrypt = async (data, base64Key) => {
  const key = importCryptoKey(base64Key);
  const encoded = encode(data);
  const iv = generateIv();
  const aad = generateAad();
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  cipher.setAAD(aad);
  const encrypted = Buffer.concat([cipher.update(encoded), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    cipher: encrypted,
    iv,
    authTag,
    aad
  };
};

export const decrypt = async (cipher, base64Key, iv, authTag, aad) => {
  const key = importCryptoKey(base64Key);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  decipher.setAAD(aad);
  const decrypted = Buffer.concat([decipher.update(cipher), decipher.final()]);
  return decode(new Uint8Array(decrypted));
};

// Example usage
// (async () => {
//   const base64Key = 'zO4qyU72lPYuq6/KfSsQ/wSCUvfBH7Av2PZ1+bjvo9Q=';
//   const message = 'xxxx';

//   try {
//     const { cipher, iv, authTag, aad } = await encrypt(message, base64Key);
//     console.log('Encrypted:', pack(cipher));
//     console.log('IV:', pack(iv));
//     console.log('AuthTag:', pack(authTag));
//     console.log('AAD:', pack(aad));

//     console.log(`${pack(cipher)}:${pack(iv)}:${pack(authTag)}:${pack(aad)}`)

//     const decryptedMessage = await decrypt(cipher, base64Key, iv, authTag, aad);
//     console.log('Decrypted:', decryptedMessage);
//   } catch (error) {
//     console.error('Error:', error);
//   }
// })();
