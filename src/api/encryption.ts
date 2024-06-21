import * as crypto from 'crypto';

const base64Key = 'VEYTCG0JMPcyiF3oPIjtm/CLfMmtXS2oJPlPJD7pwM8=';

function base64ToArrayBuffer(base64String: string): ArrayBuffer {
  const cleanedBase64String = base64String
    .replace(/[\r\n]+/g, '')
    .replace(/=/g, '');
  const binaryString = Buffer.from(cleanedBase64String, 'base64').toString(
    'binary',
  );

  const buffer = new ArrayBuffer(binaryString.length);
  const byteArray = new Uint8Array(buffer);

  for (let i = 0; i < binaryString.length; i++) {
    byteArray[i] = binaryString.charCodeAt(i);
  }

  return buffer;
}

const encode = (data: string): Uint8Array => {
  const encoder = new TextEncoder();
  return encoder.encode(data);
};

const decode = (bytestream: Uint8Array): string => {
  const decoder = new TextDecoder();
  return decoder.decode(bytestream);
};

const generateIv = (): Uint8Array => {
  return crypto.randomBytes(12);
};

export const pack = (buffer: Uint8Array): string => {
  return Buffer.from(buffer).toString('base64');
};

export const unpack = (packed: string): Uint8Array => {
  return new Uint8Array(Buffer.from(packed, 'base64'));
};


export const encrypt = async (data: string, base64Key: string) => {
  const key = await importCryptoKey(base64Key);

  const encoded = encode(data);
  const iv = generateIv();
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(encoded), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    cipher: encrypted,
    iv,
    authTag,
  };
};


export const decrypt = async (
  cipher: Buffer,
  base64Key: string,
  iv: Uint8Array,
  authTag: Buffer
) => {
  const key = await importCryptoKey(base64Key);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(cipher), decipher.final()]);
  return decode(new Uint8Array(decrypted));
};


function importCryptoKey(base64Key: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const arrayBuffer = base64ToArrayBuffer(base64Key);
      const keyBuffer = Buffer.from(arrayBuffer);
      resolve(keyBuffer);
    } catch (error) {
      reject(error);
    }
  });
}

// Example usage
(async () => {
  const base64Key = 'VEYTCG0JMPcyiF3oPIjtm/CLfMmtXS2oJPlPJD7pwM8=';
  const message = 'test_samagra';

  try {
    const { cipher, iv, authTag } = await encrypt(message, base64Key);
    console.log('Encrypted:', pack(cipher));
    console.log('IV:', pack(iv));
    console.log('AuthTag:', pack(authTag));

    const decryptedMessage = await decrypt(cipher, base64Key, iv, authTag);
    console.log('Decrypted:', decryptedMessage);
  } catch (error) {
    console.error('Error:', error);
  }
})();

