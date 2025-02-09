# 🎮 XRP Ledger Wallet (Minecraft Edition)

A feature-rich XRP Ledger wallet application with comprehensive blockchain interaction capabilities and a Minecraft-inspired UI. Manage your XRP assets, NFTs, and transactions with a familiar blocky aesthetic.

![XRP Wallet Demo](generated-icon.png)

## ✨ Features

### 💰 Wallet Management
- Create new wallets with secure encryption
- Import existing wallets via seed phrase
- Add read-only wallets for monitoring
- View real-time XRP balance
- Track transaction history
- Support for both Mainnet and Testnet

### 🖼️ NFT Features
- View your NFT collection with metadata
- Mint new NFTs with customizable properties
- Sell NFTs with transfer fee settings
- Burn unwanted NFTs
- Enhanced metadata handling with IPFS integration

### 🔒 Security
- Client-side encryption for wallet data
- No private keys stored on servers
- Password-protected wallet access
- Read-only wallet option for safe monitoring

### 🎨 UI/UX
- Minecraft-inspired responsive design
- Dark/Light theme support
- Mobile-friendly interface
- Real-time balance updates
- Transaction status notifications

## 🛠️ Tech Stack

- **Frontend**: React (TypeScript), TailwindCSS, shadcn/ui
- **Backend**: Express.js
- **Blockchain**: XRPL.js
- **State Management**: TanStack Query
- **Routing**: Wouter
- **Form Handling**: React Hook Form, Zod
- **Styling**: Tailwind CSS with Minecraft theme

## 📦 Installation

1. Clone the repository
```bash
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
```

## 🔐 Security Considerations

- Never share your seed phrase or private keys
- Always verify transaction details before confirming
- Use strong passwords for wallet encryption
- Enable 2FA when available
- Regularly backup your wallet information

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- XRPL.js team for the blockchain integration
- Minecraft for design inspiration
- shadcn/ui for the component library
- Community contributors

---

Built with ❤️ using Replit
