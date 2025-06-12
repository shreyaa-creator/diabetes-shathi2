import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Check, Clock, Circle, Pill, Syringe, Edit2, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { TrendChart } from "@/components/charts/trend-chart";
import { bengaliText } from "@/data/bengali-text";
import { diabetesMedicines, getMedicineSuggestions } from "@/data/medicines";
import { formatTime, formatDate } from "@/utils/date-utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Medicine, MedicineRecord } from "@shared/schema";

const medicineSchema = z.object({
  name: z.string().min(1, "ওষুধের নাম প্রয়োজন"),
  dosage: z.string().min(1, "ডোজ প্রয়োজন"),
  frequency: z.string().min(1, "ফ্রিকোয়েন্সি প্রয়োজন"),
  timeSlots: z.array(z.string()).min(1, "কমপক্ষে একটি সময় প্রয়োজন"),
});

const medicineRecordSchema = z.object({
  medicineId: z.number(),
  takenAt: z.string(),
  wasOnTime: z.boolean().default(true),
  notes: z.string().optional(),
});

type MedicineFormData = z.infer<typeof medicineSchema>;
type MedicineRecordFormData = z.infer<typeof medicineRecordSchema>;

export default function MedicineTracker() {
  const [selectedTime, setSelectedTime] = useState("08:00");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: medicines = [], isLoading: medicinesLoading } = useQuery<Medicine[]>({
    queryKey: ["/api/medicines"],
  });

  const { data: medicineRecords = [], isLoading: recordsLoading } = useQuery<MedicineRecord[]>({
    queryKey: ["/api/medicine-records"],
  });

  const medicineForm = useForm<MedicineFormData>({
    resolver: zodResolver(medicineSchema),
    defaultValues: {
      name: "",
      dosage: "",
      frequency: "daily",
      timeSlots: [],
    },
  });

  const createMedicineMutation = useMutation({
    mutationFn: async (data: MedicineFormData) => {
      const response = await apiRequest("POST", "/api/medicines", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medicines"] });
      medicineForm.reset();
      toast({
        title: "সফল",
        description: "ওষুধ সফলভাবে যোগ করা হয়েছে।",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "ওষুধ যোগ করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    },
  });

  const createRecordMutation = useMutation({
    mutationFn: async (data: { medicineId: number; notes?: string }) => {
      const response = await apiRequest("POST", "/api/medicine-records", {
        medicineId: data.medicineId,
        takenAt: new Date(),
        wasOnTime: true,
        notes: data.notes,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medicine-records"] });
      toast({
        title: "সফল",
        description: "ওষুধ গ্রহণ রেকর্ড করা হয়েছে।",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "ওষুধ রেকর্ড করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    },
  });

  const deleteMedicineMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/medicines/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medicines"] });
      toast({
        title: "সফল",
        description: "ওষুধ মুছে ফেলা হয়েছে।",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "ওষুধ মুছতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    },
  });

  const onSubmitMedicine = (data: MedicineFormData) => {
    const timeSlots = data.frequency === "daily" ? [selectedTime] 
                   : data.frequency === "twice_daily" ? [selectedTime, "20:00"]
                   : ["08:00", "14:00", "20:00"];
    
    createMedicineMutation.mutate({
      ...data,
      timeSlots,
    });
  };

  const handleTakeMedicine = (medicineId: number) => {
    createRecordMutation.mutate({ medicineId });
  };

  const handleDeleteMedicine = (id: number) => {
    if (confirm("আপনি কি এই ওষুধ মুছে ফেলতে চান?")) {
      deleteMedicineMutation.mutate(id);
    }
  };

  // Get today's medicine records
  const today = new Date();
  const todayRecords = medicineRecords.filter(record => {
    const recordDate = new Date(record.takenAt);
    return recordDate.toDateString() === today.toDateString();
  });

  // Calculate weekly adherence data
  const weeklyAdherence = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayRecords = medicineRecords.filter(record => {
      const recordDate = new Date(record.takenAt);
      return recordDate.toDateString() === date.toDateString();
    });
    return {
      label: date.toLocaleDateString('bn-BD', { weekday: 'short' }),
      value: dayRecords.length,
    };
  });

  return (
    <div className="animate-fade-in space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Medicine Schedule */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-bengali text-teal-800 dark:text-teal-200">
              {bengaliText.todayMedicineList}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {medicines.map((medicine) => {
                const hasTaken = todayRecords.some(record => record.medicineId === medicine.id);
                const currentTime = new Date();
                const medicineTime = medicine.timeSlots?.[0] ? new Date(`${today.toDateString()} ${medicine.timeSlots[0]}`) : null;
                const isPending = medicineTime && currentTime >= medicineTime && !hasTaken;
                const isUpcoming = medicineTime && currentTime < medicineTime;

                return (
                  <div
                    key={medicine.id}
                    className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                      isPending 
                        ? "bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800" 
                        : "bg-white/50 dark:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-3 ${
                        medicine.name.includes('ইনসুলিন') || medicine.name.includes('হিউমুলিন')
                          ? "bg-purple-100 dark:bg-purple-900/30"
                          : "bg-blue-100 dark:bg-blue-900/30"
                      }`}>
                        {medicine.name.includes('ইনসুলিন') || medicine.name.includes('হিউমুলিন') ? (
                          <Syringe className="w-6 h-6 text-purple-600" />
                        ) : (
                          <Pill className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium font-bengali">{medicine.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {medicine.dosage} • {medicine.timeSlots?.[0] && formatTime(new Date(`${today.toDateString()} ${medicine.timeSlots[0]}`))}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTakeMedicine(medicine.id)}
                      disabled={hasTaken || createRecordMutation.isPending}
                      className={`w-8 h-8 rounded-full ${
                        hasTaken 
                          ? "bg-green-500 text-white" 
                          : isPending 
                          ? "bg-orange-500 text-white"
                          : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {hasTaken ? (
                        <Check className="w-4 h-4" />
                      ) : isPending ? (
                        <Clock className="w-4 h-4" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                );
              })}
              
              {medicines.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-sm text-gray-500">কোন ওষুধ যোগ করা হয়নি</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Add Medicine */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-bengali text-teal-800 dark:text-teal-200">
              {bengaliText.addNewMedicine}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...medicineForm}>
              <form onSubmit={medicineForm.handleSubmit(onSubmitMedicine)} className="space-y-4">
                <FormField
                  control={medicineForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bengali">
                        {bengaliText.medicineName}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="মেটফরমিন"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={medicineForm.control}
                  name="dosage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bengali">
                        {bengaliText.dose}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="৫০০ মি.গ্রা."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={medicineForm.control}
                    name="frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bengali">
                          {bengaliText.frequency}
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="ফ্রিকোয়েন্সি" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="daily">{bengaliText.onceDaily}</SelectItem>
                            <SelectItem value="twice_daily">{bengaliText.twiceDaily}</SelectItem>
                            <SelectItem value="three_times_daily">{bengaliText.threeTimesDaily}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <FormLabel className="font-bengali">{bengaliText.time}</FormLabel>
                    <Input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full gradient-bg hover:shadow-lg"
                  disabled={createMedicineMutation.isPending}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="font-bengali">{bengaliText.addMedicine}</span>
                </Button>
              </form>
            </Form>

            {/* Quick Add from Database */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <h4 className="font-medium font-bengali text-teal-700 dark:text-teal-300 mb-3">জনপ্রিয় ওষুধ</h4>
              <div className="space-y-2">
                {Object.values(diabetesMedicines).slice(0, 2).map(category => 
                  category.items.slice(0, 2).map(medicine => (
                    <div
                      key={medicine.name}
                      className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded hover:bg-teal-50 dark:hover:bg-teal-900/20 cursor-pointer transition-colors"
                      onClick={() => {
                        medicineForm.setValue('name', medicine.name);
                        medicineForm.setValue('dosage', medicine.commonDose);
                      }}
                    >
                      <div>
                        <p className="font-medium font-bengali text-sm">{medicine.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{medicine.commonDose}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-6 h-6 bg-teal-500 text-white rounded-full p-0"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medicine Management */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-bengali text-teal-800 dark:text-teal-200">
            ওষুধের তালিকা
          </CardTitle>
        </CardHeader>
        <CardContent>
          {medicines.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-sm text-gray-500">কোন ওষুধ যোগ করা হয়নি</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {medicines.map((medicine) => (
                <div key={medicine.id} className="p-4 bg-white/50 dark:bg-white/5 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium font-bengali">{medicine.name}</h3>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" className="w-6 h-6 p-0">
                        <Edit2 className="w-3 h-3 text-teal-600" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-6 h-6 p-0"
                        onClick={() => handleDeleteMedicine(medicine.id)}
                        disabled={deleteMedicineMutation.isPending}
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{medicine.dosage}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {medicine.frequency === "daily" && "দিনে ১বার"}
                      {medicine.frequency === "twice_daily" && "দিনে ২বার"}
                      {medicine.frequency === "three_times_daily" && "দিনে ৩বার"}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {medicine.timeSlots?.join(", ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Medicine Adherence History */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-bengali text-teal-800 dark:text-teal-200">
            {bengaliText.medicineHistory}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <TrendChart 
              data={weeklyAdherence} 
              height={250}
              color="rgb(16, 185, 129)"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
