import qrcode from 'qrcode-terminal';
import { createInterface } from 'readline';

export default function generateQRCode(qr) {
    qrcode.generate(qr, { small: true });
}

//ask for an input
const readline = createInterface({
    input: process.stdin,
    output: process.stdout
});

readline.question('Enter the QR code: ', (qr) => {
    generateQRCode(qr);
    readline.close();
});