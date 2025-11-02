
## 🚀 Installation & Setup

https://code.visualstudio.com/download 
https://nodejs.org/en/download

## create account 
https://firebase.google.com/

### Prerequisites
- Node.js (v14 or higher)
- npm i
- Firebase project with Firestore enabled
- Email service account (for notifications)

### 1. Clone the Repository
```bash
git clone <Coinedge>
cd coinedge-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Generate a service account key:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the JSON file as `fireBaseConfig/testcoin-ServiceKey.json`

### 4. Environment Variables
Create a `.env` file in the root directory:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key
EMAIL_USER=your-email@gmail.com
 create pass key : 
EMAIL_PASS=your-app-password : https://myaccount.google.com/apppasswords

```

### 5. Start the Application
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

### 6. Access the Application
Open your browser and navigate to `http://localhost:3000`

## 🔧 Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with nodemon (auto-restart)

## 📱 Features Overview

### Authentication System
- **User Registration** - Secure account creation with email validation
- **Login/Logout** - JWT-based authentication
- **Password Reset** - Email-based password recovery
- **Token Validation** - Secure session management

### Dashboard Features
- **Portfolio Overview** - Track cryptocurrency investments
- **Market Data** - Real-time crypto prices and trends
- **Trading Interface** - Execute trades and manage positions
- **Withdrawal System** - Request and track withdrawals
- **Deposit Management** - Add funds to your account
- **Settings** - Manage account preferences



## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Secure password storage
- **Email Verification** - Account verification via email
- **Input Validation** - Server-side validation for all inputs
- **CORS Protection** - Cross-origin request security

## 🎨 Customization

### Styling
- Modify CSS files in `public/css/` directory
- Update color schemes in `style.css`
- Customize animations and transitions

### Templates
- Edit EJS templates in `views/` directory
- Modify `layout.ejs` for global layout changes
- Update individual page templates as needed

### Configuration
- Update Firebase settings in `config/firebase.js`
- Modify email templates in `utils/templates/ejs/`
- Adjust JWT settings in `utils/jwt/jwt.js`

## 📊 API Endpoints

### Authentication
- `POST /auth/registration` - User registration
- `POST /auth/login` - User login
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Password reset confirmation

### User Dashboard
- `GET /user/dashboard` - User dashboard
- `GET /user/portfolio` - Portfolio overview
- `GET /user/market` - Market data
- `GET /user/trading` - Trading interface

### Withdrawal System
- `POST /user/create` - Create withdrawal request
- `GET /user/history/:userId` - Get withdrawal history
- `GET /user/balance/:userId` - Get user balance
- `PUT /user/update/:withdrawalId` - Update withdrawal status

### Crypto Data
- `GET /user/cryptos/top10` - Get top 10 cryptocurrencies
- `POST /user/contact` - Submit contact form

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)



**CoinEdge** - Empowering the future of blockchain trading! 🚀

<!-- Firebase Project: testCoin -->













<!-- # CoinEdge - Blockchain Trading Platform

A modern, responsive web application built with the MEAN stack for fixed-odds cryptocurrency trading on the blockchain.

## Features

- 🎨 **Modern UI Design** - Beautiful, responsive interface with Bootstrap 5
- 🔒 **Blockchain Integration** - Secure trading on the blockchain
- 📱 **Mobile Responsive** - Works perfectly on all devices
- ⚡ **Fast Performance** - Optimized for speed and efficiency
- 🎯 **Fixed-Odds Trading** - Predictable trading outcomes

## Tech Stack

- **Frontend**: EJS, Bootstrap 5, Font Awesome, Custom CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Cloud)
- **Styling**: Custom CSS with gradients and animations

## Project Structure

```
coinedge-app/
├── app.js                 # Main application file
├── package.json           # Dependencies and scripts
├── views/                 # EJS templates
│   ├── layout.ejs        # Main layout template
│   ├── index.ejs         # Landing page
│   ├── trading.ejs       # Trading page
│   ├── about.ejs         # About page
│   └── contact.ejs       # Contact page
├── public/               # Static assets
│   ├── css/
│   │   └── style.css     # Custom styles
│   ├── js/
│   │   └── main.js       # JavaScript functionality
│   └── images/
│       └── crypto-trading.svg
└── README.md
```

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd metacash-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Create a `.env` file in the root directory
   - Add your MongoDB connection string:
   ```
   PORT=3000
   MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/metacash?retryWrites=true&w=majority
   NODE_ENV=development
   ```

4. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Features Overview

### Landing Page
- **Hero Section**: Eye-catching design with CoinEdge branding
- **Feature Cards**: Highlighting key platform benefits
- **Responsive Design**: Works on all screen sizes
- **Smooth Animations**: Engaging user experience

### Navigation
- **Fixed Header**: Always visible navigation
- **Mobile Menu**: Collapsible navigation for mobile devices
- **Wallet Connection**: Simulated wallet integration
- **User Profile**: User account management

### Footer
- **Four Icon Navigation**: Quick access to main features
- **Social Links**: Connect with the community
- **Responsive Layout**: Adapts to all screen sizes

## Customization

### Colors
The application uses a custom color scheme defined in CSS variables:
- Primary: `#ffc107` (Gold/Yellow)
- Secondary: `#212529` (Dark)
- Accent: `#17a2b8` (Blue)

### Styling
- Modify `public/css/style.css` for custom styles
- Update `views/layout.ejs` for layout changes
- Customize `public/js/main.js` for JavaScript functionality

## Database Integration

The application is configured to connect to MongoDB Atlas (cloud database). Update the connection string in your `.env` file with your MongoDB credentials.

## Development

### Available Scripts
- `npm start` - Start the production server
- `npm run dev` - Start development server with nodemon

### Adding New Pages
1. Create a new EJS template in the `views/` directory
2. Add a route in `app.js`
3. Update navigation in `layout.ejs` if needed

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team.

---

**CoinEdge** - The future of blockchain trading is here! 🚀

<!-- firebase project name -->
testCoin -->