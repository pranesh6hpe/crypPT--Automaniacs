import React, { useEffect, useState, useRef } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { FiMaximize2 } from 'react-icons/fi'

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend)

type Range = '1d' | '1m' | '1y' | 'custom'

interface CoinOption {
  id: string
  symbol: string
  name: string
}

interface PriceChartProps {
  coins: CoinOption[]
}

const rangeToDays = {
  '1d': 1,
  '1m': 30,
  '1y': 365,
}

const PriceChart: React.FC<PriceChartProps> = ({ coins }) => {
  const [selectedId, setSelectedId] = useState(coins.length > 0 ? coins[0].id : '')
  const [chartData, setChartData] = useState<any>(null)
  const [range, setRange] = useState<Range>('1d')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const chartRef = useRef<any>(null)

  const getCacheKey = (coinId: string, range: string, start?: string, end?: string) =>
    `priceChart-${coinId}-${range}${start && end ? `-${start}-${end}` : ''}`

  const fetchChartData = async () => {
    if (!selectedId) return

    let url = ''
    let cacheKey = ''

    if (range !== 'custom') {
      const days = rangeToDays[range]
      url = `https://api.coingecko.com/api/v3/coins/${selectedId}/market_chart?vs_currency=usd&days=${days}&interval=daily`
      cacheKey = getCacheKey(selectedId, range)
    } else {
      if (!startDate || !endDate) return
      const from = Math.floor(new Date(startDate).getTime() / 1000)
      const to = Math.floor(new Date(endDate).getTime() / 1000)
      url = `https://api.coingecko.com/api/v3/coins/${selectedId}/market_chart/range?vs_currency=usd&from=${from}&to=${to}`
      cacheKey = getCacheKey(selectedId, 'custom', startDate, endDate)
    }

    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      setChartData(JSON.parse(cached))
      return
    }

    try {
      const res = await fetch(url)
      const data = await res.json()
      const labels = data.prices.map((item: number[]) =>
        new Date(item[0]).toLocaleDateString()
      )
      const prices = data.prices.map((item: number[]) => item[1])

      const backgroundColor = 'rgba(118, 48, 234, 0.3)' // purple 30% opacity
      const borderColor = '#7630EA'

      const chartPayload = {
        labels,
        datasets: [
          {
            label: `Price (USD)`,
            data: prices,
            fill: true,
            backgroundColor,
            borderColor,
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: '#7630EA',
          },
        ],
      }

      localStorage.setItem(cacheKey, JSON.stringify(chartPayload))
      setChartData(chartPayload)
    } catch (err) {
      console.error('Failed to fetch chart data:', err)
    }
  }

  const openChartInNewWindow = () => {
    if (!chartData) return

    const newWin = window.open('', '_blank', 'width=1200,height=800')
    if (!newWin) return

    const chartId = 'popupChart'
    newWin.document.write(`
      <html>
        <head>
          <title>Expanded Chart</title>
          <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
          <style>
            body {
              margin: 0;
              padding: 20px;
              background-color: #1e1e1e;
              font-family: sans-serif;
              color: #00e8cf;
            }
            .chart-container {
              height: 90vh;
              width: 100%;
            }
            .close-btn {
              position: fixed;
              top: 20px;
              right: 20px;
              padding: 8px 12px;
              background: #7630EA;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
              z-index: 1000;
              transition: background-color 0.3s;
            }
            .close-btn:hover {
              background-color: #00e8cf;
              color: #00739d;
            }
          </style>
        </head>
        <body>
          <button class="close-btn" onclick="window.close()">Close</button>
          <div class="chart-container">
            <canvas id="${chartId}"></canvas>
          </div>
        </body>
      </html>
    `)

    newWin.document.close()

    newWin.onload = () => {
      const ctx = newWin.document.getElementById(chartId) as HTMLCanvasElement
      if (!ctx) return
      new (newWin as any).Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: '#00e8cf', font: { size: 14 } },
            },
            tooltip: {
              backgroundColor: '#00739d',
              titleColor: '#17eba0',
              bodyColor: '#00e8cf',
            },
          },
          scales: {
            x: {
              ticks: { color: '#00e8cf' },
              grid: { color: '#00739d' },
            },
            y: {
              ticks: { color: '#00e8cf' },
              grid: { color: '#00739d' },
            },
          },
        },
      })
    }
  }

  useEffect(() => {
    if (range === 'custom' && (!startDate || !endDate)) return
    fetchChartData()
  }, [selectedId, range, startDate, endDate])

  return (
    <div className="p-6 border rounded-2xl shadow-lg bg-white dark:bg-[#1e1e1e] max-w-3xl mx-auto relative">
      {/* Header with Expand Icon */}
      <div className="flex justify-between items-center mb-4">
        <div
          className="text-lg font-bold flex items-center gap-2"
          style={{ color: '#00e8cf' }}
        >
          <b>Price Chart</b>
          <button
            onClick={openChartInNewWindow}
            className="hover:text-[#7630EA] dark:hover:text-[#17eba0]"
            title="Expand Chart"
            style={{ color: '#00739d' }}
          >
            <FiMaximize2 size={18} />
          </button>
        </div>
      </div>

      {/* Coin Selector */}
      <div className="mb-4">
        <label
          className="font-semibold text-sm mb-1 block"
          style={{ color: '#00739d' }}
        >
          Select Coin:
        </label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="px-3 py-2 border rounded-md w-full text-sm dark:bg-gray-800 dark:text-white"
          style={{
            borderColor: '#7630EA',
            backgroundColor: 'transparent',
            color: '#00e8cf',
          }}
        >
          {coins.map((coin) => (
            <option
              key={coin.id}
              value={coin.id}
              style={{ backgroundColor: '#1e1e1e', color: '#00e8cf' }}
            >
              {coin.name} ({coin.symbol.toUpperCase()})
            </option>
          ))}
        </select>
      </div>

      {/* Range Buttons */}
      <div className="mb-0 flex flex-wrap gap-4">
        {['1d', '1m', '1y', 'custom'].map((r) => (
          <button
            key={r}
            onClick={() => setRange(r as Range)}
            className={`text-sm px-3 py-1.5 rounded-lg font-medium shadow-sm transition`}
            style={{
              backgroundColor: range === r ? '#7630EA' : '#00739d',
              color: range === r ? '#ffffff' : '#17eba0',
            }}
          >
            {r === '1d'
              ? '1 Day'
              : r === '1m'
              ? '1 Month'
              : r === '1y'
              ? '1 Year'
              : 'Custom'}
          </button>
        ))}
      </div>

      {/* Custom Range Inputs */}
      {range === 'custom' && (
        <div className="mb-4 flex flex-col sm:flex-row gap-4 sm:items-center">
          <div
            className="flex items-center gap-2 text-sm"
            style={{ color: '#00739d' }}
          >
            <label htmlFor="start-date">Start Date:</label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 border rounded-md dark:bg-gray-800 dark:text-white"
              style={{ borderColor: '#7630EA', color: '#00e8cf' }}
            />
          </div>
          <div
            className="flex items-center gap-2 text-sm"
            style={{ color: '#00739d' }}
          >
            <label htmlFor="end-date">End Date:</label>
            <input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 border rounded-md dark:bg-gray-800 dark:text-white"
              style={{ borderColor: '#7630EA', color: '#00e8cf' }}
            />
          </div>
        </div>
      )}

      {/* Chart Display */}
      {!chartData ? (
        <p className="text-center mt-4" style={{ color: '#00739d' }}>
          Loading chart...
        </p>
      ) : (
        <div className="w-full max-h-[400px] mt-2">
          <Line
            ref={chartRef}
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { labels: { color: '#00739d', font: { size: 12 } } },
                tooltip: {
                  backgroundColor: '#00739d',
                  titleColor: '#17eba0',
                  bodyColor: '#00e8cf',
                  padding: 10,
                  cornerRadius: 6,
                },
              },
              scales: {
                x: {
                  ticks: { color: '#00739d', maxRotation: 45 },
                  grid: { color: 'rgba(118, 48, 234, 0.1)' },
                },
                y: {
                  ticks: { color: '#00739d' },
                  grid: { color: 'rgba(118, 48, 234, 0.1)' },
                },
              },
            }}
          />
        </div>
      )}
    </div>
  )
}

export default PriceChart
