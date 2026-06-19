'use client';

import { useState, useEffect } from 'react';
import { Trip } from '@/types';
import { tripsApi } from '@/utils/api';

interface WeatherViewProps {
  trip: Trip;
  onTripUpdated: (updatedTrip: Trip) => void;
}

export default function WeatherView({ trip, onTripUpdated }: WeatherViewProps) {
  const [report, setReport] = useState<any>(trip.weatherReport && trip.weatherReport.current ? trip.weatherReport : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getForecastDate = (dayIndex: number) => {
    if (!trip.startDate) return '';
    const start = new Date(trip.startDate);
    const targetDate = new Date(start.getTime() + dayIndex * 24 * 60 * 60 * 1000);
    return targetDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  useEffect(() => {
    if (trip.weatherReport && trip.weatherReport.current) {
      setReport(trip.weatherReport);
    } else {
      loadWeather();
    }
  }, [trip]);

  const loadWeather = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await tripsApi.getWeather(trip._id);
      setReport(data);
      onTripUpdated({
        ...trip,
        weatherReport: data,
      });
    } catch (err) {
      console.error(err);
      setError('Failed to load weather report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes('sunny') || c.includes('clear')) return '☀️';
    if (c.includes('cloudy') || c.includes('overcast')) return '☁️';
    if (c.includes('rain') || c.includes('shower') || c.includes('drizzle')) return '☔';
    if (c.includes('snow') || c.includes('flurry')) return '❄️';
    if (c.includes('thunder') || c.includes('storm')) return '⛈️';
    if (c.includes('wind') || c.includes('breezy')) return '💨';
    return '🌤️'; // partly cloudy / default
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
        <p className="text-slate-400 text-sm animate-pulse">Fetching seasonal meteorology stats for {trip.destination}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 text-sm mb-4">⚠️ {error}</p>
        <button
          onClick={loadWeather}
          className="btn-secondary text-xs px-5 py-2.5"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            ⛈️ Weather & Travel Advisories
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Expected climate conditions and safety warnings for your trip duration.
          </p>
        </div>
        <button
          id="refresh-weather-btn"
          onClick={loadWeather}
          className="px-3.5 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
        >
          🔄 Refresh Forecast
        </button>
      </div>

      {report && report.current ? (
        <div className="space-y-6">
          {/* Current Weather card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Main card */}
            <div className="flex items-center gap-5 p-5 rounded-2xl bg-white/2 border border-white/5">
              <div className="text-5xl">{getWeatherIcon(report.current.condition)}</div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Current Condition</span>
                <div className="text-3xl font-black text-white mt-1">{report.current.tempC}°C</div>
                <div className="text-xs text-indigo-300 font-semibold mt-1">
                  {report.current.condition} · Rain {report.current.rainProbabilityPercent}%
                </div>
              </div>
            </div>

            {/* Sub stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-white/2 border border-white/5 text-left">
                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Humidity</span>
                <div className="text-lg font-black text-white mt-1">{report.current.humidityPercent}%</div>
              </div>
              <div className="p-4 rounded-xl bg-white/2 border border-white/5 text-left">
                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Wind Speed</span>
                <div className="text-lg font-black text-white mt-1">{report.current.windSpeedKph} km/h</div>
              </div>
            </div>
          </div>

          {/* Travel Advisories */}
          {report.warnings && report.warnings.length > 0 && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs space-y-1.5">
              <div className="font-bold text-red-200 flex items-center gap-1.5">
                <span>🚨</span>
                <span>Travel Safety Advisories:</span>
              </div>
              {report.warnings.map((w: string, idx: number) => (
                <p key={idx} className="leading-relaxed">• {w}</p>
              ))}
            </div>
          )}

          {/* 7-Day Forecast Grid */}
          <div>
            <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3">7-Day Forecast</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {report.forecast.map((f: any, idx: number) => (
                <div key={idx} className="p-3 text-center border border-white/5 rounded-xl bg-white/1 text-xs">
                  <div className="text-slate-500 font-bold">{f.day}</div>
                  {trip.startDate && (
                    <div className="text-[10px] text-slate-400 font-medium mt-0.5">{getForecastDate(idx)}</div>
                  )}
                  <div className="text-2xl my-2">{getWeatherIcon(f.condition)}</div>
                  <div className="text-sm font-black text-white">{f.tempMaxC}°C</div>
                  <div className="text-[10px] text-slate-500">{f.tempMinC}°C</div>
                  <div className="text-[9px] text-indigo-300 font-semibold mt-1 truncate">{f.condition}</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">☔ {f.rainProbabilityPercent}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-slate-500 text-xs py-10">Weather data is currently empty.</p>
      )}
    </div>
  );
}
