import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, Search, CloudSun, Cloud, CloudRain, 
  Sun, Wind, Droplets, Thermometer, MapPin, Snowflake, CloudLightning
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getWeather } from "@/lib/api";
import { useLanguage } from "@/i18n/context";

export default function Weather() {
  const { t, lang } = useLanguage();
  const [zipCode, setZipCode] = useState("37087");
  const [searchZip, setSearchZip] = useState("");
  
  const { data: weather, isLoading } = useQuery({
    queryKey: ["weather", zipCode],
    queryFn: () => getWeather(zipCode),
  });

  const handleSearch = () => {
    if (searchZip.length === 5) {
      setZipCode(searchZip);
    }
  };

  const getWeatherIcon = (condition: string) => {
    const lower = condition.toLowerCase();
    if (lower.includes("thunder")) return CloudLightning;
    if (lower.includes("snow")) return Snowflake;
    if (lower.includes("rain") || lower.includes("drizzle") || lower.includes("shower")) return CloudRain;
    if (lower.includes("cloud") || lower.includes("overcast")) return Cloud;
    if (lower.includes("partly")) return CloudSun;
    if (lower.includes("fog")) return Cloud;
    return Sun;
  };

  const getDayName = (dateStr: string, index: number) => {
    if (index === 0) return t("common.today");
    const date = new Date(dateStr);
    return date.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { weekday: 'short' });
  };

  const getRoadCondition = (condition: string) => {
    const lower = condition.toLowerCase();
    if (lower.includes("snow") || lower.includes("ice")) {
      return { text: t("weather.hazardous"), color: "bg-red-500/20 text-red-400 border-red-500/30" };
    }
    if (lower.includes("rain") || lower.includes("shower") || lower.includes("drizzle")) {
      return { text: t("weather.wetRoads"), color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" };
    }
    if (lower.includes("fog")) {
      return { text: t("weather.lowVisibility"), color: "bg-orange-500/20 text-orange-400 border-orange-500/30" };
    }
    return { text: t("weather.clearDry"), color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" };
  };

  const CurrentIcon = weather ? getWeatherIcon(weather.current.condition) : CloudSun;
  const roadCondition = weather ? getRoadCondition(weather.current.condition) : { text: t("common.loading"), color: "bg-white/10 text-white" };

  return (
    <div className="space-y-6 pb-20">
      <div className="relative -mx-3 sm:-mx-4 md:-mx-6 2xl:-mx-8 -mt-3 sm:-mt-4 md:-mt-6 2xl:-mt-8 px-4 sm:px-6 md:px-8 pt-6 pb-8 mb-2 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-[#0a0f1e] to-cyan-600/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.15),transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
        <div className="relative flex items-center gap-3 sm:gap-4 mb-4">
          <Link href="/">
            <Button data-testid="button-back-home" variant="ghost" size="icon" className="-ml-2 min-h-[44px] min-w-[44px] text-white/70 hover:text-white hover:bg-white/[0.06]">
              <ArrowLeft className="size-6" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg sm:text-2xl font-heading font-bold bg-gradient-to-r from-white via-white to-blue-200 bg-clip-text text-transparent">{t("weather.title")}</h1>
            <p className="text-xs text-white/40">{t("weather.current")} {zipCode}</p>
          </div>
        </div>

        <div className="relative flex gap-3">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
            <Input 
              data-testid="input-zip-code"
              placeholder={t("weather.enterZip")}
              className="pl-10 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30 focus:border-blue-500/30"
              value={searchZip}
              onChange={(e) => setSearchZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button 
            data-testid="button-search-weather"
            onClick={handleSearch}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 border-0"
          >
            <Search className="size-4 mr-2" /> {t("common.search")}
          </Button>
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500/15 via-cyan-500/10 to-blue-500/15 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="size-16 sm:size-24 rounded-2xl sm:rounded-3xl bg-blue-500/20 flex items-center justify-center backdrop-blur-sm border border-blue-500/20 shrink-0">
                <CurrentIcon className="size-8 sm:size-14 text-blue-400" />
              </div>
              <div>
                <p data-testid="text-current-temp" className="text-4xl sm:text-6xl font-bold text-white">
                  {isLoading ? "--" : weather?.current.temp}°
                </p>
                <p className="text-sm sm:text-lg text-white/50">{weather?.current.condition || t("common.loading")}</p>
                <p className="text-xs sm:text-sm text-white/40 flex items-center gap-1 mt-1">
                  <MapPin className="size-3" /> {weather?.location || t("common.loading")}
                </p>
              </div>
            </div>
            <div className="hidden sm:block space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Thermometer className="size-4 text-orange-400" />
                <span className="text-white/50">{t("weather.feelsLike")}:</span>
                <span className="text-white font-medium">{weather?.current.temp || "--"}°F</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Droplets className="size-4 text-blue-400" />
                <span className="text-white/50">{t("weather.humidity")}:</span>
                <span className="text-white font-medium">{weather?.current.humidity || "--"}%</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Wind className="size-4 text-gray-400" />
                <span className="text-white/50">{t("weather.wind")}:</span>
                <span className="text-white font-medium">{weather?.current.windSpeed || "--"} mph</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/[0.06]">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/50">{t("weather.roadConditions")}</span>
            <Badge className={roadCondition.color}>
              {roadCondition.text}
            </Badge>
          </div>
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl rounded-2xl overflow-hidden">
        <div className="p-4 pb-2">
          <h3 className="text-sm font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">{t("weather.liveRadar")}</h3>
        </div>
        <div className="p-0">
          <div className="relative h-72 bg-[#0a0f1e]/50">
            <iframe
              data-testid="weather-radar-iframe"
              src="https://embed.windy.com/embed2.html?lat=36.21&lon=-86.29&detailLat=36.21&detailLon=-86.29&width=650&height=450&zoom=7&level=surface&overlay=radar&product=radar&menu=&message=true&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=mph&metricTemp=%C2%B0F&radarRange=-1"
              className="w-full h-full border-0"
              title="Weather Radar"
              allow="geolocation"
            />
            <div className="absolute bottom-2 right-2">
              <Badge variant="outline" className="bg-[#0a0f1e]/80 backdrop-blur-sm text-xs border-white/[0.08] text-white/50">
                {t("weather.poweredByWindy")}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl rounded-2xl overflow-hidden">
        <div className="p-4 pb-2">
          <h3 className="text-sm font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">{t("weather.forecast7Day")}</h3>
        </div>
        <div className="p-4 pt-2">
          <div className="flex gap-2 overflow-x-auto pb-2 sm:grid sm:grid-cols-7 sm:overflow-x-visible sm:pb-0">
            {weather?.forecast.map((day, i) => {
              const DayIcon = getWeatherIcon(day.condition);
              return (
                <div 
                  key={i}
                  data-testid={`forecast-day-${i}`}
                  className={`p-3 rounded-xl text-center transition-all min-w-[80px] shrink-0 sm:min-w-0 sm:shrink ${i === 0 ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-white/[0.03] border border-white/[0.06]'}`}
                >
                  <p className="text-xs font-medium text-white mb-2">{getDayName(day.date, i)}</p>
                  <DayIcon className={`size-6 mx-auto mb-2 ${i === 0 ? 'text-cyan-400' : 'text-blue-400'}`} />
                  <p className="text-sm font-bold text-white">{day.high}°</p>
                  <p className="text-xs text-white/40">{day.low}°</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:hidden">
        <div className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl rounded-2xl p-3 text-center">
          <Thermometer className="size-5 text-orange-400 mx-auto mb-1" />
          <p className="text-xs text-white/40">{t("weather.feelsLike")}</p>
          <p className="text-lg font-bold text-white">{weather?.current.temp || "--"}°</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl rounded-2xl p-3 text-center">
          <Droplets className="size-5 text-blue-400 mx-auto mb-1" />
          <p className="text-xs text-white/40">{t("weather.humidity")}</p>
          <p className="text-lg font-bold text-white">{weather?.current.humidity || "--"}%</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl rounded-2xl p-3 text-center">
          <Wind className="size-5 text-gray-400 mx-auto mb-1" />
          <p className="text-xs text-white/40">{t("weather.wind")}</p>
          <p className="text-lg font-bold text-white">{weather?.current.windSpeed || "--"}mph</p>
        </div>
      </div>
    </div>
  );
}
