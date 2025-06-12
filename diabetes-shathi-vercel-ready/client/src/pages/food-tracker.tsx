import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search, Utensils, Edit2, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { bengaliText } from "@/data/bengali-text";
import { bangladeshiFoods, getFoodSuggestions, type FoodItem } from "@/data/bangladeshi-foods";
import { formatTime, formatDate } from "@/utils/date-utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { FoodEntry } from "@shared/schema";

const foodEntrySchema = z.object({
  foodName: z.string().min(1, "খাবারের নাম প্রয়োজন"),
  portion: z.string().min(1, "পরিমাণ প্রয়োজন"),
  carbohydrates: z.number().min(0, "কার্বোহাইড্রেট ০ বা তার বেশি হতে হবে"),
  calories: z.number().optional(),
  mealType: z.string().min(1, "খাবারের ধরন প্রয়োজন"),
  consumedAt: z.string().min(1),
});

type FoodEntryFormData = z.infer<typeof foodEntrySchema>;

export default function FoodTracker() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [customFood, setCustomFood] = useState({
    name: "",
    carbs: "",
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: foodEntries = [], isLoading } = useQuery<FoodEntry[]>({
    queryKey: ["/api/food-entries"],
  });

  const foodForm = useForm<FoodEntryFormData>({
    resolver: zodResolver(foodEntrySchema),
    defaultValues: {
      foodName: "",
      portion: "",
      carbohydrates: 0,
      calories: 0,
      mealType: "",
      consumedAt: new Date().toISOString().slice(0, 16),
    },
  });

  const createFoodEntryMutation = useMutation({
    mutationFn: async (data: FoodEntryFormData) => {
      const response = await apiRequest("POST", "/api/food-entries", {
        ...data,
        consumedAt: new Date(data.consumedAt),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/food-entries"] });
      foodForm.reset();
      toast({
        title: "সফল",
        description: "খাবার সফলভাবে যোগ করা হয়েছে।",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "খাবার যোগ করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    },
  });

  const deleteFoodEntryMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/food-entries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/food-entries"] });
      toast({
        title: "সফল",
        description: "খাবার মুছে ফেলা হয়েছে।",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "খাবার মুছতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FoodEntryFormData) => {
    createFoodEntryMutation.mutate(data);
  };

  const handleQuickAdd = (food: FoodItem) => {
    foodForm.setValue('foodName', food.name);
    foodForm.setValue('portion', food.portion);
    foodForm.setValue('carbohydrates', food.carbs);
    foodForm.setValue('calories', food.calories);
  };

  const handleCustomFoodAdd = () => {
    if (customFood.name && customFood.carbs) {
      foodForm.setValue('foodName', customFood.name);
      foodForm.setValue('carbohydrates', parseInt(customFood.carbs));
      foodForm.setValue('portion', "১ পরিবেশন");
      setCustomFood({ name: "", carbs: "" });
    }
  };

  const handleDeleteEntry = (id: number) => {
    if (confirm("আপনি কি এই খাবার মুছে ফেলতে চান?")) {
      deleteFoodEntryMutation.mutate(id);
    }
  };

  // Get today's food entries
  const today = new Date();
  const todayEntries = foodEntries.filter(entry => {
    const entryDate = new Date(entry.consumedAt);
    return entryDate.toDateString() === today.toDateString();
  });

  // Calculate total carbs for today
  const totalCarbs = todayEntries.reduce((sum, entry) => sum + entry.carbohydrates, 0);

  // Group today's entries by meal type
  const mealGroups = {
    breakfast: todayEntries.filter(entry => entry.mealType === "breakfast"),
    lunch: todayEntries.filter(entry => entry.mealType === "lunch"),
    dinner: todayEntries.filter(entry => entry.mealType === "dinner"),
    snack: todayEntries.filter(entry => entry.mealType === "snack"),
  };

  // Get food suggestions based on search
  const foodSuggestions = searchQuery 
    ? getFoodSuggestions(searchQuery).slice(0, 5)
    : [];

  // Get foods by selected category
  const categoryFoods = selectedCategory 
    ? bangladeshiFoods[selectedCategory]?.items.slice(0, 6) || []
    : Object.values(bangladeshiFoods).flatMap(cat => cat.items).slice(0, 6);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Food Search & Add */}
        <div className="lg:col-span-1">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="font-bengali text-teal-800 dark:text-teal-200">
                {bengaliText.addFood}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search Box */}
              <div className="relative mb-4">
                <Input
                  placeholder="খাবার খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              </div>

              {/* Search Results */}
              {searchQuery && (
                <div className="mb-4 space-y-2">
                  <h4 className="font-medium font-bengali text-teal-700 dark:text-teal-300">খুঁজে পাওয়া খাবার</h4>
                  {foodSuggestions.map((food, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-white/50 dark:bg-white/5 rounded-lg hover:bg-white/70 dark:hover:bg-white/10 cursor-pointer transition-colors"
                      onClick={() => handleQuickAdd(food)}
                    >
                      <div>
                        <p className="font-medium font-bengali text-sm">{food.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {food.carbs}গ্রা কার্বস / {food.portion}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-6 h-6 bg-teal-500 text-white rounded-full p-0"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Add Foods */}
              <div className="space-y-3 mb-6">
                <h4 className="font-medium font-bengali text-teal-700 dark:text-teal-300">
                  {bengaliText.popularFoods}
                </h4>
                <div className="space-y-2">
                  {categoryFoods.map((food, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white/50 dark:bg-white/5 rounded-lg hover:bg-white/70 dark:hover:bg-white/10 cursor-pointer transition-colors"
                      onClick={() => handleQuickAdd(food)}
                    >
                      <div>
                        <p className="font-medium font-bengali">{food.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {food.carbs}গ্রা কার্বস / {food.portion}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 bg-teal-500 text-white rounded-full p-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Food Entry */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <h4 className="font-medium font-bengali text-teal-700 dark:text-teal-300 mb-3">
                  {bengaliText.customFood}
                </h4>
                <div className="space-y-3">
                  <Input
                    placeholder="খাবারের নাম"
                    value={customFood.name}
                    onChange={(e) => setCustomFood({ ...customFood, name: e.target.value })}
                    className="text-sm"
                  />
                  <Input
                    type="number"
                    placeholder="কার্বোহাইড্রেট (গ্রাম)"
                    value={customFood.carbs}
                    onChange={(e) => setCustomFood({ ...customFood, carbs: e.target.value })}
                    className="text-sm"
                  />
                  <Button
                    onClick={handleCustomFoodAdd}
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium"
                    disabled={!customFood.name || !customFood.carbs}
                  >
                    যোগ করুন
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Food Log */}
        <div className="lg:col-span-2">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="font-bengali text-teal-800 dark:text-teal-200">
                  {bengaliText.todayFoodLog}
                </CardTitle>
                <div className="text-right">
                  <p className="text-2xl font-bold gradient-text">
                    {Math.round(totalCarbs)}গ্রা
                  </p>
                  <p className="text-sm text-teal-600 dark:text-teal-400 font-bengali">
                    {bengaliText.totalCarbohydrates}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Meal Categories */}
              <div className="space-y-6">
                {/* Breakfast */}
                <div className="border-l-4 border-orange-400 pl-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold font-bengali text-teal-700 dark:text-teal-300">
                      {bengaliText.breakfast}
                    </h4>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {mealGroups.breakfast.reduce((sum, entry) => sum + entry.carbohydrates, 0)}গ্রা কার্বস
                    </span>
                  </div>
                  <div className="space-y-2">
                    {mealGroups.breakfast.map((entry) => (
                      <div key={entry.id} className="flex justify-between items-center p-2 bg-white/50 dark:bg-white/5 rounded">
                        <span className="font-bengali">{entry.foodName} ({entry.portion})</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{entry.carbohydrates}গ্রা</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="w-6 h-6 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {mealGroups.breakfast.length === 0 && (
                      <p className="text-sm text-gray-500 italic">কোন খাবার যোগ করা হয়নি</p>
                    )}
                  </div>
                </div>

                {/* Lunch */}
                <div className="border-l-4 border-green-400 pl-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold font-bengali text-teal-700 dark:text-teal-300">
                      {bengaliText.lunch}
                    </h4>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {mealGroups.lunch.reduce((sum, entry) => sum + entry.carbohydrates, 0)}গ্রা কার্বস
                    </span>
                  </div>
                  <div className="space-y-2">
                    {mealGroups.lunch.map((entry) => (
                      <div key={entry.id} className="flex justify-between items-center p-2 bg-white/50 dark:bg-white/5 rounded">
                        <span className="font-bengali">{entry.foodName} ({entry.portion})</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{entry.carbohydrates}গ্রা</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="w-6 h-6 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {mealGroups.lunch.length === 0 && (
                      <p className="text-sm text-gray-500 italic">কোন খাবার যোগ করা হয়নি</p>
                    )}
                  </div>
                </div>

                {/* Dinner */}
                <div className="border-l-4 border-blue-400 pl-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold font-bengali text-teal-700 dark:text-teal-300">
                      {bengaliText.dinner}
                    </h4>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {mealGroups.dinner.reduce((sum, entry) => sum + entry.carbohydrates, 0)}গ্রা কার্বস
                    </span>
                  </div>
                  <div className="space-y-2">
                    {mealGroups.dinner.map((entry) => (
                      <div key={entry.id} className="flex justify-between items-center p-2 bg-white/50 dark:bg-white/5 rounded">
                        <span className="font-bengali">{entry.foodName} ({entry.portion})</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{entry.carbohydrates}গ্রা</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="w-6 h-6 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {mealGroups.dinner.length === 0 && (
                      <p className="text-sm text-gray-500 italic">কোন খাবার যোগ করা হয়নি</p>
                    )}
                  </div>
                </div>

                {/* Snacks */}
                <div className="border-l-4 border-purple-400 pl-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold font-bengali text-teal-700 dark:text-teal-300">
                      {bengaliText.snack}
                    </h4>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {mealGroups.snack.reduce((sum, entry) => sum + entry.carbohydrates, 0)}গ্রা কার্বস
                    </span>
                  </div>
                  <div className="space-y-2">
                    {mealGroups.snack.map((entry) => (
                      <div key={entry.id} className="flex justify-between items-center p-2 bg-white/50 dark:bg-white/5 rounded">
                        <span className="font-bengali">{entry.foodName} ({entry.portion})</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{entry.carbohydrates}গ্রা</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="w-6 h-6 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {mealGroups.snack.length === 0 && (
                      <p className="text-sm text-gray-500 italic">কোন খাবার যোগ করা হয়নি</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Food Categories */}
              <div className="mt-6 p-4 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-lg">
                <h4 className="font-semibold font-bengali text-teal-700 dark:text-teal-300 mb-2">
                  {bengaliText.foodCategories}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(bangladeshiFoods).map(([key, category]) => (
                    <Button
                      key={key}
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCategory(selectedCategory === key ? "" : key)}
                      className={`font-bengali hover:bg-teal-50 dark:hover:bg-teal-900/20 ${
                        selectedCategory === key ? "bg-teal-100 dark:bg-teal-900/30" : ""
                      }`}
                    >
                      {category.category}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Food Entry Form */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-bengali text-teal-800 dark:text-teal-200">
            খাবার বিস্তারিত যোগ করুন
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...foodForm}>
            <form onSubmit={foodForm.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <FormField
                control={foodForm.control}
                name="foodName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bengali">
                      {bengaliText.foodName}
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="খাবারের নাম" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={foodForm.control}
                name="portion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bengali">
                      পরিমাণ
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="১ কাপ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={foodForm.control}
                name="carbohydrates"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bengali">
                      কার্বোহাইড্রেট (গ্রাম)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="25"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={foodForm.control}
                name="mealType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bengali">
                      খাবারের ধরন
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="নির্বাচন করুন" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="breakfast">{bengaliText.breakfast}</SelectItem>
                        <SelectItem value="lunch">{bengaliText.lunch}</SelectItem>
                        <SelectItem value="dinner">{bengaliText.dinner}</SelectItem>
                        <SelectItem value="snack">{bengaliText.snack}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-end">
                <Button
                  type="submit"
                  className="w-full gradient-bg hover:shadow-lg"
                  disabled={createFoodEntryMutation.isPending}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="font-bengali">যোগ করুন</span>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
