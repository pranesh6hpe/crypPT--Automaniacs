import requests
from datetime import datetime, timezone
from app.database import get_db, Coin

def fetch_and_store_data():
    url = "https://api.coingecko.com/api/v3/coins/markets"
    params = {
        'vs_currency': 'usd',
        'order': 'market_cap_desc',
        'per_page': 100,
        'page': 1,
        'sparkline': 'false'
    }
    response = requests.get(url, params=params)

    if response.status_code != 200:
        print("Failed to fetch data from CoinGecko")
        return

    data = response.json()
    db = get_db()
    db.query(Coin).delete()  # Wipes existing records

    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

    for coin in data:
        new_coin = Coin(
            name=coin.get('name'),
            symbol=coin.get('symbol'),
            current_price=coin.get('current_price'),
            market_cap=coin.get('market_cap'),
            total_volume=coin.get('total_volume'),
            price_change_24h=coin.get('price_change_24h'),
            price_change_pct_24h=coin.get('price_change_percentage_24h'),
            image=coin.get('image'),
            last_updated=coin.get('last_updated'),
            recorded_at=timestamp
        )
        db.add(new_coin)

    db.commit()
    db.close()
