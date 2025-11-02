const axios = require('axios');
const admin = require('firebase-admin');
const userModel = require('../../models/userModel');

// Firestore reference
const db = admin.firestore();
const COLLECTION_NAME = 'cryptoCache';
const DOC_ID = 'top10cryptos'; // single doc to hold top 10 cache

const fetchTop10Cryptos = async (req, res) => {
  try {
    const cacheRef = db.collection(COLLECTION_NAME).doc(DOC_ID);
    const cacheDoc = await cacheRef.get();

    // Check if cache exists and is recent (within 30 minutes)
    if (cacheDoc.exists) {
      const cachedData = cacheDoc.data();
      const lastUpdated = cachedData.updatedAt?.toDate ? cachedData.updatedAt.toDate() : cachedData.updatedAt;
      const now = new Date();

      const diffMinutes = (now - lastUpdated) / (1000 * 60);
      if (diffMinutes < 30 && cachedData.top10) {
        console.log('✅ Serving from Firestore cache');
        return res.status(200).json({
          success: true,
          updatedAt: cachedData.updatedAt,
          top10: cachedData.top10,
          source: 'cache'
        });
      }
    }

    // Otherwise fetch from CoinGecko API
    console.log('🌐 Fetching fresh data from CoinGecko...');
    const url = 'https://api.coingecko.com/api/v3/coins/markets';
    const params = {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: 10,
      page: 1,
      sparkline: true
    };

    const { data } = await axios.get(url, { params });

    const top10 = data.map((coin, i) => ({
      rank: i + 1,
      image: coin.image,
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      price: coin.current_price,
      marketCap: coin.market_cap,
      change24h: coin.price_change_percentage_24h,
      chartData: coin.sparkline_in_7d ? coin.sparkline_in_7d.price : []
    }));

    // Store new data in Firestore
    await cacheRef.set({
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      top10
    });

    return res.status(200).json({
      success: true,
      updatedAt: new Date(),
      top10,
      source: 'api'
    });

  } catch (error) {
    console.error('❌ Error fetching or caching crypto data:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch crypto data'
    });
  }
};



const usercontact= async(req, res) => {
    const { name, email, message } = req.body;
    try {
        const contact = await userModel.userContact({ name, email, message });
        res.status(200).json({ success: true, contact });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
  };

module.exports = { fetchTop10Cryptos, usercontact };
