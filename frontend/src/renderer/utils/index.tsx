export function bufferToUrl(buffer: Buffer, mimetype = 'image/jpeg'): string {
  const base64 = btoa(
    new Uint8Array(buffer).reduce(
      (data, byte) => data + String.fromCharCode(byte),
      '',
    ),
  );
  return `data:${mimetype};base64,${base64}`;
}

export default { bufferToUrl };
