import { useQuery } from "@tanstack/react-query";
import { Droplet, Pill, Utensils, TrendingUp, ArrowDown, ArrowUp, Clock, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlucoseChart } from "@/components/charts/glucose-chart";
import { AdherenceChart } from "@/components/charts/adherence-chart";
import { bengaliText } from "@/data/bengali-text";
import { formatDateTime, getTimeAgo } from "@/utils/date-utils";
import { getGlucoseStatus, calculateAverage } from "@/utils/chart-utils";
import type { GlucoseReading, FoodEntry, MedicineRecord } from "@shared/schema";

export default function Dashboard() {
  const { data: glucoseReadings = [] } = useQuery<GlucoseReading[]>({
    queryKey: ["/api/glucose-readings"],
  });

  const { data: foodEntries = [] } = useQuery<FoodEntry[]>({
    queryKey: ["/api/food-entries"],
  });

  const { data: medicineRecords = [] } = useQuery<MedicineRecord[]>({
    queryKey: ["/api/medicine-records"],
  });

  // Calculate metrics
  const todayReadings = glucoseReadings.filter(reading => {
    const today = new Date();
    const readingDate = new Date(reading.measuredAt);
    return readingDate.toDateString() === today.toDateString();
  });

  const weekReadings = glucoseReadings.filter(reading => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(reading.measuredAt) >= weekAgo;
  });

  const todayCarbs = foodEntries
    .filter(entry => {
      const today = new Date();
      const entryDate = new Date(entry.consumedAt);
      return entryDate.toDateString() === today.toDateString();
    })
    .reduce((sum, entry) => sum + entry.carbohydrates, 0);

  const todayMedicines = medicineRecords.filter(record => {
    const today = new Date();
    const recordDate = new Date(record.takenAt);
    return recordDate.toDateString() === today.toDateString();
  });

  const latestReading = glucoseReadings[0];
  const averageGlucose = calculateAverage(weekReadings.map(r => r.level));
  const glucoseStatus = latestReading ? getGlucoseStatus(latestReading.level) : null;

  // Recent activities
  const recentActivities = [
    ...glucoseReadings.slice(0, 2).map(reading => ({
      type: "glucose",
      time: reading.measuredAt,
      description: `গ্লুকোজ রেকর্ড করেছেন - ${reading.level} mmol/L`,
      status: getGlucoseStatus(reading.level).status,
      icon: Droplet,
      color: "text-green-600",
      bgColor: "bg-green-100",
    })),
    ...medicineRecords.slice(0, 2).map(record => ({
      type: "medicine",
      time: record.takenAt,
      description: "ওষুধ নিয়েছেন",
      status: record.wasOnTime ? "On Time" : "Late",
      icon: Pill,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    })),
    ...foodEntries.slice(0, 1).map(entry => ({
      type: "food",
      time: entry.consumedAt,
      description: `খাবার রেকর্ড করেছেন - ${entry.foodName}`,
      status: `${entry.carbohydrates}g carbs`,
      icon: Utensils,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 3);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Hero Section */}
      <Card className="glass-card relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-emerald-500/10"></div>
        <CardContent className="relative p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h2 className="text-2xl font-bold font-bengali text-teal-800 dark:text-teal-200 mb-2">
                {bengaliText.todayHealthSummary}
              </h2>
              <p className="text-teal-600 dark:text-teal-400">Today's Health Summary</p>
            </div>
            <div className="mt-4 md:mt-0 text-right">
              <p className="text-3xl font-bold gradient-text">
                {averageGlucose ? averageGlucose.toFixed(1) : "---"}
              </p>
              <p className="text-sm text-teal-600 dark:text-teal-400 font-bengali">
                {bengaliText.averageGlucose} (mmol/L)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-teal-600 dark:text-teal-400 font-bengali">
                  {bengaliText.todayGlucose}
                </p>
                <p className="text-2xl font-bold text-teal-800 dark:text-teal-200">
                  {latestReading ? latestReading.level.toFixed(1) : "---"}
                </p>
                <p className="text-xs text-gray-500">mmol/L</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <Droplet className="w-6 h-6 text-green-600" />
              </div>
            </div>
            {glucoseStatus && (
              <div className="mt-4 flex items-center">
                <ArrowDown className="w-4 h-4 text-green-500 mr-1" />
                <span className={`text-sm font-medium ${glucoseStatus.color}`}>
                  {glucoseStatus.status}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-teal-600 dark:text-teal-400 font-bengali">
                  {bengaliText.medicineTaken}
                </p>
                <p className="text-2xl font-bold text-teal-800 dark:text-teal-200">
                  {todayMedicines.length}/4
                </p>
                <p className="text-xs text-gray-500 font-bengali">{bengaliText.today}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Pill className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <Clock className="w-4 h-4 text-orange-500 mr-1" />
              <span className="text-orange-500 text-sm font-medium">
                {4 - todayMedicines.length} {bengaliText.remaining}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-teal-600 dark:text-teal-400 font-bengali">
                  {bengaliText.carbohydrates}
                </p>
                <p className="text-2xl font-bold text-teal-800 dark:text-teal-200">
                  {Math.round(todayCarbs)}{bengaliText.grams}
                </p>
                <p className="text-xs text-gray-500 font-bengali">{bengaliText.today}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <Utensils className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <ArrowUp className="w-4 h-4 text-yellow-500 mr-1" />
              <span className="text-yellow-500 text-sm font-medium">Moderate</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-teal-600 dark:text-teal-400 font-bengali">
                  {bengaliText.weeklyAverage}
                </p>
                <p className="text-2xl font-bold text-teal-800 dark:text-teal-200">
                  {averageGlucose ? averageGlucose.toFixed(1) : "---"}
                </p>
                <p className="text-xs text-gray-500">mmol/L</p>
              </div>
              <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-teal-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <ArrowDown className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500 text-sm font-medium">Improving</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-bengali text-teal-800 dark:text-teal-200">
              {bengaliText.glucoseTrend}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GlucoseChart data={glucoseReadings} />
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-bengali text-teal-800 dark:text-teal-200">
              {bengaliText.adherence}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AdherenceChart taken={todayMedicines.length} total={4} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-bengali text-teal-800 dark:text-teal-200">
            সাম্প্রতিক কার্যকলাপ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className="flex items-center p-3 bg-white/50 dark:bg-white/5 rounded-lg">
                  <div className={`w-10 h-10 ${activity.bgColor} dark:bg-opacity-20 rounded-full flex items-center justify-center mr-3`}>
                    <Icon className={`w-5 h-5 ${activity.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium font-bengali">{activity.description}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {getTimeAgo(activity.time)}
                    </p>
                  </div>
                  <span className={`text-sm font-medium ${activity.color}`}>
                    {activity.status}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
