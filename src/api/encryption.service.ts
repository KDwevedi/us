const { subtle, getRandomValues } = globalThis.crypto;

const hexKey =
  'bf47a4b9c8a142dabd8f46000de758c71c16b55d3f33531d21800479fcbd7ccf';
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
  return crypto.getRandomValues(new Uint8Array(12));
};

export const pack = (buffer: ArrayBuffer): string => {
  const byteArray = new Uint8Array(buffer);
  let binaryString = '';
  for (let i = 0; i < byteArray.length; i++) {
    binaryString += String.fromCharCode(byteArray[i]);
  }
  const base64String = Buffer.from(binaryString, 'binary').toString('base64');
  return base64String;
};

export const unpack = (packed: string): ArrayBuffer => {
  const binaryString = Buffer.from(packed, 'base64').toString('binary');
  const buffer = new ArrayBuffer(binaryString.length);
  const byteArray = new Uint8Array(buffer);
  for (let i = 0; i < binaryString.length; i++) {
    byteArray[i] = binaryString.charCodeAt(i);
  }

  return buffer;
};

export const encrypt = async (data: string, base64Key: string) => {
  const key = await importCryptoKey(base64Key);

  const encoded = encode(data);
  const iv = generateIv();
  const cipher = await subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encoded,
  );
  return {
    cipher,
    iv,
  };
};

export const decrypt = async (
  cipher: ArrayBuffer,
  base64Key: string,
  iv: Uint8Array,
) => {
  const key = await importCryptoKey(base64Key);
  const encoded = await subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    cipher,
  );
  return decode(new Uint8Array(encoded));
};

function importCryptoKey(base64Key: string): Promise<CryptoKey> {
  return new Promise((resolve, reject) => {
    try {
      const arrayBuffer = base64ToArrayBuffer(base64Key);
      subtle
        .importKey('raw', arrayBuffer, { name: 'AES-GCM', length: 256 }, true, [
          'encrypt',
          'decrypt',
        ])
        .then(resolve)
        .catch(reject);
    } catch (error) {
      reject(error);
    }
  });
}

// Example usage
(async () => {
  const base64Key = 'VEYTCG0JMPcyiF3oPIjtm/CLfMmtXS2oJPlPJD7pwM8='; // Replace with your Base64 key
  const message = 'pass@123';

  try {
    const { cipher, iv } = await encrypt(message, base64Key);
    console.log('Encrypted:', pack(cipher));
    console.log('IV',pack(iv))
    console.log("IV", new TextEncoder().encode(pack(iv)))


    const decryptedMessage = await decrypt(cipher, base64Key, iv);
    console.log('Decrypted:', decryptedMessage);
  } catch (error) {
    console.error('Error:', error);
  }
})();
