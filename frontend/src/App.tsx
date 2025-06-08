import { useEffect, useState } from "react"
import PriceChart from "./components/PriceChart"
import Chatbot from "./components/Chatbot"
import { Button } from "./components/ui/button"
import {
  Alert,
  AlertDescription,
  AlertTitle
} from "./components/ui/alert"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "./components/ui/tabs"
import { Skeleton } from "./components/ui/skeleton"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from "./components/ui/tooltip"
import { Badge } from "./components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "./components/ui/card"
import "./index.css"

interface Coin {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  total_volume: number
}

const containerClass = "w-full px-4 font-mono text-[#00ff00] transition-all duration-500 ease-in-out"

function App() {
  const [coins, setCoins] = useState<Coin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>("")

  const fetchData = () => {
    setLoading(true)
    setError(null)
    fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h"
    )
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch data")
        return res.json()
      })
      .then((data) => {
        const sorted = data.sort((a: Coin, b: Coin) => b.current_price - a.current_price)
        setCoins(sorted)
        setLastUpdated(new Date().toLocaleTimeString())
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchData()
  }, [])

  const top5MarketCap = [...coins].sort((a, b) => b.market_cap - a.market_cap).slice(0, 5)
  const top5Volume = [...coins].sort((a, b) => b.total_volume - a.total_volume).slice(0, 5)

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen w-screen bg-[#0f0f0f] text-[#00ff00] font-mono px-4">
        <h2 className="text-2xl mb-4">🔐 Connecting to Crypto Matrix...</h2>
        <div className="w-full max-w-xl h-4 bg-[#003300] rounded-full overflow-hidden shadow-lg">
          <div className="h-full bg-[#00ff00] loading-bar" />
        </div>
        <style>
          {`
            .loading-bar {
              width: 0%;
              animation: grow 3s infinite ease-in-out;
            }
            @keyframes grow {
              0% { width: 0%; }
              50% { width: 100%; }
              100% { width: 0%; }
            }
          `}
        </style>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full" style={{ backgroundColor: "#0f0f0f", minHeight: "100vh", width: "100vw" }}>
        <Alert variant="destructive" className="bg-[#330000] text-[#ff5555] border-[#ff4444] max-w-md mx-auto mt-10">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className={containerClass} style={{ backgroundColor: "#0f0f0f", minHeight: "100vh", width: "100vw" }}>
        <div className="flex justify-center items-center flex-col mb-6" style={{ height: "120px" }}>
          <h1
            className="text-4xl font-bold tracking-tight relative inline-block"
            style={{ color: "#00ff00", fontFamily: "'Source Code Pro', monospace" }}
          >
            CrypPT - Crypto Price Tracker
            <span className="blink" />
          </h1>
        </div>

        <p className="text-center mb-4 text-sm" style={{ color: "#33ff33" }}>
          Last updated: {lastUpdated}
        </p>

        <div className="text-center mb-6">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="mx-auto px-6 py-2 text-base font-medium border border-[#00ff00] text-[#00ff00] hover:bg-[#003300]"
                onClick={fetchData}
                style={{ boxShadow: "0 0 8px #00ff00" }}
              >
                🔄 Refresh Data
              </Button>
            </TooltipTrigger>
            <TooltipContent style={{ backgroundColor: "#001a00", color: "#00ff00" }}>
              <p>Reload market data from CoinGecko</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Tabs defaultValue="coins" className="w-full">
          <TabsList className="grid grid-cols-3 w-full mb-6 text-base" style={{ borderBottom: "1px solid #00ff00" }}>
            <TabsTrigger value="coins">Coins</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="chart">Chart</TabsTrigger>
          </TabsList>

          <TabsContent value="coins">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {coins.map((coin) => (
                <Card key={coin.id} className="text-[#00ff00] bg-[#002200] p-4 rounded-xl shadow-[0_0_10px_#00ff00] min-h-[180px] hover:scale-105 transition">
                  <CardHeader className="flex justify-between items-center p-2">
                    <CardTitle>{coin.name} ({coin.symbol.toUpperCase()})</CardTitle>
                    <img src={coin.image} alt={coin.name} className="w-6 h-6" />
                  </CardHeader>
                  <CardContent className="p-2 text-sm">
                    <p><strong>Price:</strong> ${coin.current_price.toLocaleString()}</p>
                    <p className="flex items-center gap-2">
                      <span className="font-semibold">Change:</span>
                      <Badge className={coin.price_change_percentage_24h > 0 ? "bg-[#006600]" : "bg-[#660000]"}>
                        {coin.price_change_percentage_24h.toFixed(2)}%
                      </Badge>
                    </p>
                    <p><strong>Volume:</strong> ${coin.total_volume.toLocaleString()}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="text-[#00ff00] bg-[#002200] p-4 rounded-xl shadow-[0_0_10px_#00ff00]">
              <CardHeader><CardTitle>Market Analytics</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Top 5 Coins by Market Cap</h2>
                    <ul className="list-disc list-inside space-y-1">
                      {top5MarketCap.map((coin) => (
                        <li key={coin.id}>{coin.name}: ${coin.market_cap.toLocaleString()}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Top 5 Coins by Volume</h2>
                    <ul className="list-disc list-inside space-y-1">
                      {top5Volume.map((coin) => (
                        <li key={coin.id}>{coin.name}: ${coin.total_volume.toLocaleString()}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chart">
            <Card className="text-[#00ff00] bg-[#002200] p-4 rounded-xl shadow-[0_0_10px_#00ff00]">
              <CardHeader><CardTitle>Price Chart</CardTitle></CardHeader>
              <CardContent><PriceChart coins={coins} /></CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 🧠 Chatbot Widget */}
        <Chatbot />
      </div>

      <style>
        {`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
          .blink {
            display: inline-block;
            width: 10px;
            height: 32px;
            background-color: #00ff00;
            margin-left: 8px;
            animation: blink 1s step-start 0s infinite;
          }
          html, body, #root {
            height: 100%;
            margin: 0;
            padding: 0;
            background-color: #0f0f0f;
            color: #00ff00;
            font-family: 'Source Code Pro', monospace;
          }
        `}
      </style>
    </TooltipProvider>
  )
}

export default App
