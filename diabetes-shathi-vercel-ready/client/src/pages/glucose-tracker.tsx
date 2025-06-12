import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit2, Trash2, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { GlucoseChart } from "@/components/charts/glucose-chart";
import { bengaliText } from "@/data/bengali-text";
import { formatDateTime } from "@/utils/date-utils";
import { getGlucoseStatus } from "@/utils/chart-utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { GlucoseReading } from "@shared/schema";

const glucoseSchema = z.object({
  level: z.number().min(0.1).max(30),
  measurementType: z.string().min(1),
  measuredAt: z.string().min(1),
  notes: z.string().optional(),
});

type GlucoseFormData = z.infer<typeof glucoseSchema>;

export default function GlucoseTracker() {
  const [selectedPeriod, setSelectedPeriod] = useState("7");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: glucoseReadings = [], isLoading } = useQuery<GlucoseReading[]>({
    queryKey: ["/api/glucose-readings"],
  });

  const form = useForm<GlucoseFormData>({
    resolver: zodResolver(glucoseSchema),
    defaultValues: {
      level: 0,
      measurementType: "",
      measuredAt: new Date().toISOString().slice(0, 16),
      notes: "",
    },
  });

  const createReadingMutation = useMutation({
    mutationFn: async (data: GlucoseFormData) => {
      const response = await apiRequest("POST", "/api/glucose-readings", {
        ...data,
        level: Number(data.level),
        measuredAt: new Date(data.measuredAt),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/glucose-readings"] });
      form.reset();
      toast({
        title: "সফল",
        description: "গ্লুকোজ রিডিং সফলভাবে যোগ করা হয়েছে।",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "গ্লুকোজ রিডিং যোগ করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    },
  });

  const deleteReadingMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/glucose-readings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/glucose-readings"] });
      toast({
        title: "সফল",
        description: "গ্লুকোজ রিডিং মুছে ফেলা হয়েছে।",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "গ্লুকোজ রিডিং মুছতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: GlucoseFormData) => {
    createReadingMutation.mutate(data);
  };

  const handleDelete = (id: number) => {
    if (confirm("আপনি কি এই রিডিং মুছে ফেলতে চান?")) {
      deleteReadingMutation.mutate(id);
    }
  };

  const filteredReadings = glucoseReadings.filter(reading => {
    const days = parseInt(selectedPeriod);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return new Date(reading.measuredAt) >= cutoffDate;
  });

  return (
    <div className="animate-fade-in space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Reading Form */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-bengali text-teal-800 dark:text-teal-200">
              {bengaliText.addNewReading}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bengali">
                        {bengaliText.glucoseLevel}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="6.8"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="measurementType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bengali">
                        {bengaliText.measurementTime}
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="সময় নির্বাচন করুন" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="before_meal">{bengaliText.beforeMeal}</SelectItem>
                          <SelectItem value="after_meal">{bengaliText.afterMeal}</SelectItem>
                          <SelectItem value="bedtime">{bengaliText.bedtime}</SelectItem>
                          <SelectItem value="other">{bengaliText.otherTime}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="measuredAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bengali">
                        {bengaliText.dateTime}
                      </FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bengali">
                        {bengaliText.notes}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="কোন বিশেষ কিছু..."
                          className="h-20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full gradient-bg hover:shadow-lg"
                  disabled={createReadingMutation.isPending}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="font-bengali">{bengaliText.saveReading}</span>
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Glucose Trend Chart */}
        <div className="lg:col-span-2">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="font-bengali text-teal-800 dark:text-teal-200">
                  {bengaliText.glucoseTrend}
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant={selectedPeriod === "7" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPeriod("7")}
                  >
                    ৭ দিন
                  </Button>
                  <Button
                    variant={selectedPeriod === "30" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPeriod("30")}
                  >
                    ৩০ দিন
                  </Button>
                  <Button
                    variant={selectedPeriod === "90" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPeriod("90")}
                  >
                    ৯০ দিন
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <GlucoseChart data={filteredReadings} height={320} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Readings */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-bengali text-teal-800 dark:text-teal-200">
            {bengaliText.recentReadings}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-sm text-gray-500">{bengaliText.loading}</div>
            </div>
          ) : glucoseReadings.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-sm text-gray-500">কোন রিডিং পাওয়া যায়নি</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bengali">{bengaliText.dateTime}</TableHead>
                    <TableHead className="font-bengali">লেভেল</TableHead>
                    <TableHead className="font-bengali">{bengaliText.time}</TableHead>
                    <TableHead className="font-bengali">স্ট্যাটাস</TableHead>
                    <TableHead className="font-bengali">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {glucoseReadings.slice(0, 10).map((reading) => {
                    const status = getGlucoseStatus(reading.level);
                    return (
                      <TableRow key={reading.id}>
                        <TableCell>{formatDateTime(reading.measuredAt)}</TableCell>
                        <TableCell className="font-medium">
                          {reading.level.toFixed(1)} mmol/L
                        </TableCell>
                        <TableCell>
                          {reading.measurementType === "before_meal" && "খাবার আগে"}
                          {reading.measurementType === "after_meal" && "খাবার পরে"}
                          {reading.measurementType === "bedtime" && "ঘুমানোর আগে"}
                          {reading.measurementType === "other" && "অন্য সময়"}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${status.bgColor} ${status.color}`}>
                            {status.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-teal-600 hover:text-teal-700"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(reading.id)}
                              disabled={deleteReadingMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
