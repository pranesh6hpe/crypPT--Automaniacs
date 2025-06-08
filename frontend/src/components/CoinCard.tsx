// src/components/CoinCard.tsx
interface Coin {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  price_change_percentage_24h: number
}

export default function CoinCard({ coin }: { coin: Coin }) {
  const isPositive = coin.price_change_percentage_24h >= 0

  return (
    <div className="coin-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <img src={coin.image} alt={coin.name} width={36} height={36} />
        <h2 style={{ margin: 0, fontSize: 20 }}>
          {coin.name} <span style={{ color: '#777' }}>({coin.symbol.toUpperCase()})</span>
        </h2>
      </div>
      <p style={{ fontSize: 26, fontWeight: 'bold', margin: '10px 0' }}>
        ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </p>
      <p
        style={{
          color: isPositive ? 'green' : 'red',
          fontWeight: 600,
          fontSize: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {isPositive ? '▲' : '▼'} {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
      </p>
    </div>
  )
}
