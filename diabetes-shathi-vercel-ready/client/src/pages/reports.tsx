import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, Share, Download, Calendar, TrendingUp, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { TrendChart } from "@/components/charts/trend-chart";
import { bengaliText } from "@/data/bengali-text";
import { generatePDFReport } from "@/utils/pdf-generator";
import { formatDate } from "@/utils/date-utils";
import { calculateAverage, getGlucoseStatus } from "@/utils/chart-utils";
import { useToast } from "@/hooks/use-toast";
import type { GlucoseReading, FoodEntry, MedicineRecord } from "@shared/schema";

export default function Reports() {
  const [reportType, setReportType] = useState("weekly");
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [includeOptions, setIncludeOptions] = useState({
    glucose: true,
    medicine: true,
    food: true,
    notes: false,
  });

  const { toast } = useToast();

  const { data: glucoseReadings = [] } = useQuery<GlucoseReading[]>({
    queryKey: ["/api/glucose-readings"],
  });

  const { data: foodEntries = [] } = useQuery<FoodEntry[]>({
    queryKey: ["/api/food-entries"],
  });

  const { data: medicineRecords = [] } = useQuery<MedicineRecord[]>({
    queryKey: ["/api/medicine-records"],
  });

  // Filter data by date range
  const filteredData = {
    glucoseReadings: glucoseReadings.filter(reading => {
      const date = new Date(reading.measuredAt);
      return date >= new Date(startDate) && date <= new Date(endDate);
    }),
    foodEntries: foodEntries.filter(entry => {
      const date = new Date(entry.consumedAt);
      return date >= new Date(startDate) && date <= new Date(endDate);
    }),
    medicineRecords: medicineRecords.filter(record => {
      const date = new Date(record.takenAt);
      return date >= new Date(startDate) && date <= new Date(endDate);
    }),
  };

  // Calculate analytics
  const analytics = {
    averageGlucose: calculateAverage(filteredData.glucoseReadings.map(r => r.level)),
    medicineAdherence: medicineRecords.length > 0 
      ? Math.round((filteredData.medicineRecords.length / medicineRecords.length) * 100) 
      : 0,
    dailyCarbs: filteredData.foodEntries.length > 0 
      ? Math.round(filteredData.foodEntries.reduce((sum, entry) => sum + entry.carbohydrates, 0) / 
          Math.max(1, new Set(filteredData.foodEntries.map(e => new Date(e.consumedAt).toDateString())).size))
      : 0,
    targetAchievement: 72, // Placeholder calculation
  };

  // Prepare monthly trend data
  const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    const monthReadings = glucoseReadings.filter(reading => {
      const readingDate = new Date(reading.measuredAt);
      return readingDate >= monthStart && readingDate <= monthEnd;
    });
    
    return {
      label: date.toLocaleDateString('bn-BD', { month: 'short' }),
      value: calculateAverage(monthReadings.map(r => r.level)) || 0,
    };
  });

  // Food category distribution
  const foodCategories = [
    { label: "ভাত", value: 40, color: "rgb(20, 184, 166)" },
    { label: "ডাল", value: 25, color: "rgb(16, 185, 129)" },
    { label: "সবজি", value: 15, color: "rgb(6, 182, 212)" },
    { label: "মাছ-মাংস", value: 15, color: "rgb(139, 92, 246)" },
    { label: "ফল", value: 5, color: "rgb(245, 158, 11)" },
  ];

  const handleGeneratePDF = () => {
    const reportData = {
      ...filteredData,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    };
    
    generatePDFReport(reportData);
    toast({
      title: "সফল",
      description: "রিপোর্ট PDF ডাউনলোড শুরু হয়েছে।",
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "ডায়াবেটিস সাথী - স্বাস্থ্য রিপোর্ট",
        text: `${formatDate(new Date(startDate))} থেকে ${formatDate(new Date(endDate))} পর্যন্ত স্বাস্থ্য রিপোর্ট`,
      });
    } else {
      toast({
        title: "তথ্য",
        description: "শেয়ার করার ফিচার এই ব্রাউজারে সমর্থিত নয়।",
      });
    }
  };

  const updateReportType = (type: string) => {
    setReportType(type);
    const today = new Date();
    
    switch (type) {
      case "weekly":
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 7);
        setStartDate(weekStart.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
        break;
      case "monthly":
        const monthStart = new Date(today);
        monthStart.setDate(today.getDate() - 30);
        setStartDate(monthStart.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
        break;
      case "custom":
        // Keep current dates
        break;
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Generate Report */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-bengali text-teal-800 dark:text-teal-200">
              {bengaliText.generateReport}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="font-bengali text-teal-700 dark:text-teal-300 mb-2 block">
                  {bengaliText.reportType}
                </Label>
                <Select value={reportType} onValueChange={updateReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">{bengaliText.weeklySummary}</SelectItem>
                    <SelectItem value="monthly">{bengaliText.monthlyReport}</SelectItem>
                    <SelectItem value="doctor">{bengaliText.doctorReport}</SelectItem>
                    <SelectItem value="custom">{bengaliText.customReport}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="font-bengali text-teal-700 dark:text-teal-300 mb-2 block">
                  {bengaliText.timePeriod}
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bengali text-teal-700 dark:text-teal-300 block">
                  {bengaliText.include}
                </Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="glucose"
                      checked={includeOptions.glucose}
                      onCheckedChange={(checked) => 
                        setIncludeOptions(prev => ({ ...prev, glucose: checked as boolean }))
                      }
                    />
                    <Label htmlFor="glucose" className="font-bengali text-sm">
                      {bengaliText.glucoseReadings}
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="medicine"
                      checked={includeOptions.medicine}
                      onCheckedChange={(checked) => 
                        setIncludeOptions(prev => ({ ...prev, medicine: checked as boolean }))
                      }
                    />
                    <Label htmlFor="medicine" className="font-bengali text-sm">
                      {bengaliText.medicineIntake}
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="food"
                      checked={includeOptions.food}
                      onCheckedChange={(checked) => 
                        setIncludeOptions(prev => ({ ...prev, food: checked as boolean }))
                      }
                    />
                    <Label htmlFor="food" className="font-bengali text-sm">
                      {bengaliText.foodInfo}
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="notes"
                      checked={includeOptions.notes}
                      onCheckedChange={(checked) => 
                        setIncludeOptions(prev => ({ ...prev, notes: checked as boolean }))
                      }
                    />
                    <Label htmlFor="notes" className="font-bengali text-sm">
                      {bengaliText.notesComments}
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleGeneratePDF}
                  className="w-full gradient-bg hover:shadow-lg"
                >
                  <Download className="w-4 h-4 mr-2" />
                  <span className="font-bengali">{bengaliText.downloadPdf}</span>
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleShare}
                  className="w-full border-teal-500 text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                >
                  <Share className="w-4 h-4 mr-2" />
                  <span className="font-bengali">{bengaliText.share}</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Overview */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-bengali text-teal-800 dark:text-teal-200">
              {bengaliText.analyticsSummary}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bengali text-green-800 dark:text-green-200">
                    গড় গ্লুকোজ লেভেল
                  </span>
                  <span className="font-bold text-green-800 dark:text-green-200">
                    {analytics.averageGlucose ? analytics.averageGlucose.toFixed(1) : "---"} mmol/L
                  </span>
                </div>
                <Progress 
                  value={analytics.averageGlucose ? Math.min((analytics.averageGlucose / 10) * 100, 100) : 0}
                  className="h-2"
                />
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bengali text-blue-800 dark:text-blue-200">
                    ওষুধ পালনের হার
                  </span>
                  <span className="font-bold text-blue-800 dark:text-blue-200">
                    {analytics.medicineAdherence}%
                  </span>
                </div>
                <Progress 
                  value={analytics.medicineAdherence}
                  className="h-2"
                />
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bengali text-purple-800 dark:text-purple-200">
                    দৈনিক কার্বোহাইড্রেট
                  </span>
                  <span className="font-bold text-purple-800 dark:text-purple-200">
                    {analytics.dailyCarbs}গ্রা
                  </span>
                </div>
                <Progress 
                  value={Math.min((analytics.dailyCarbs / 300) * 100, 100)}
                  className="h-2"
                />
              </div>

              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bengali text-orange-800 dark:text-orange-200">
                    লক্ষ্য অর্জনের হার
                  </span>
                  <span className="font-bold text-orange-800 dark:text-orange-200">
                    {analytics.targetAchievement}%
                  </span>
                </div>
                <Progress 
                  value={analytics.targetAchievement}
                  className="h-2"
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-white/50 dark:bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-teal-600">{filteredData.glucoseReadings.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-bengali">গ্লুকোজ রিডিং</div>
              </div>
              <div className="text-center p-3 bg-white/50 dark:bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-teal-600">{filteredData.medicineRecords.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-bengali">ওষুধ গ্রহণ</div>
              </div>
              <div className="text-center p-3 bg-white/50 dark:bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-teal-600">{filteredData.foodEntries.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-bengali">খাবার এন্ট্রি</div>
              </div>
              <div className="text-center p-3 bg-white/50 dark:bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-teal-600">
                  {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-bengali">দিন</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-bengali text-teal-800 dark:text-teal-200">
              মাসিক ট্রেন্ড
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <TrendChart 
                data={monthlyTrend} 
                height={250}
                color="rgb(20, 184, 166)"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-bengali text-teal-800 dark:text-teal-200">
              খাবারের বিভাগ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {foodCategories.map((category) => (
                <div key={category.label} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="font-bengali text-sm">{category.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{ 
                          width: `${category.value}%`,
                          backgroundColor: category.color 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{category.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Report Summary */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-bengali text-teal-800 dark:text-teal-200">
            রিপোর্ট সারসংক্ষেপ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold font-bengali text-teal-700 dark:text-teal-300 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                গ্লুকোজ পরিস্থিতি
              </h3>
              <div className="space-y-2">
                {filteredData.glucoseReadings.slice(0, 3).map((reading) => {
                  const status = getGlucoseStatus(reading.level);
                  return (
                    <div key={reading.id} className="flex justify-between items-center p-2 bg-white/50 dark:bg-white/5 rounded">
                      <span className="text-sm">{formatDate(reading.measuredAt)}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{reading.level.toFixed(1)}</span>
                        <span className={`text-xs px-2 py-1 rounded ${status.bgColor} ${status.color}`}>
                          {status.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold font-bengali text-teal-700 dark:text-teal-300 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                ট্রেন্ড বিশ্লেষণ
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <div className="text-sm font-bengali text-green-800 dark:text-green-200">
                    গ্লুকোজ নিয়ন্ত্রণ
                  </div>
                  <div className="text-lg font-bold text-green-600">উন্নতি</div>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <div className="text-sm font-bengali text-blue-800 dark:text-blue-200">
                    ওষুধ পালন
                  </div>
                  <div className="text-lg font-bold text-blue-600">স্থিতিশীল</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold font-bengali text-teal-700 dark:text-teal-300 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                সুপারিশ
              </h3>
              <div className="space-y-2">
                <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm">
                  <span className="font-bengali text-yellow-800 dark:text-yellow-200">
                    নিয়মিত গ্লুকোজ পরিমাপ করুন
                  </span>
                </div>
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded text-sm">
                  <span className="font-bengali text-green-800 dark:text-green-200">
                    কার্বোহাইড্রেট নিয়ন্ত্রণে রাখুন
                  </span>
                </div>
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                  <span className="font-bengali text-blue-800 dark:text-blue-200">
                    ওষুধ সময়মতো নিন
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
