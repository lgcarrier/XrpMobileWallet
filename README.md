git clone <repository-url>
cd xrp-wallet
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file
```env
VITE_API_URL=http://localhost:5000
```

4. Start the development server
```bash
npm run dev
```

## 🎮 Usage Guide

### Creating a New Wallet
1. Launch the application
2. Click "Create New Wallet"
3. Set a strong password
4. Save your seed phrase securely

### Importing an Existing Wallet
1. Click "Import Existing Wallet"
2. Enter your seed phrase
3. Set a new password for local encryption

### Managing NFTs
1. Navigate to the NFTs tab
2. View your collection
3. Click "Mint NFT" to create new ones
4. Use "Sell" or "Burn" options to manage NFTs

### Sending XRP
1. Click "Send" in the navigation
2. Enter recipient's address
3. Specify amount
4. Confirm transaction

### Receiving XRP
1. Click "Receive"
2. Copy your address or use QR code
3. Share with sender

## 🔧 Development

### Project Structure
```
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── pages/
│   │   └── App.tsx
├── server/
│   ├── routes.ts
│   └── storage.ts
└── shared/
    └── schema.ts
```

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build