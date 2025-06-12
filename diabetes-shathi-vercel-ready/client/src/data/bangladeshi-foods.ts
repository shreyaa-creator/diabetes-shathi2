export interface FoodItem {
  name: string;
  carbs: number;
  portion: string;
  calories: number;
  category: string;
}

export const bangladeshiFoods: Record<string, { category: string; items: FoodItem[] }> = {
  rice: {
    category: "ভাত ও চাল",
    items: [
      { name: "সাদা ভাত", carbs: 28, portion: "১ কাপ", calories: 130, category: "rice" },
      { name: "বাসমতি চাল", carbs: 22, portion: "১ কাপ", calories: 120, category: "rice" },
      { name: "লাল চাল", carbs: 23, portion: "১ কাপ", calories: 110, category: "rice" },
      { name: "পোলাও", carbs: 35, portion: "১ প্লেট", calories: 220, category: "rice" },
      { name: "বিরিয়ানি", carbs: 45, portion: "১ প্লেট", calories: 350, category: "rice" },
      { name: "খিচুড়ি", carbs: 30, portion: "১ বাটি", calories: 180, category: "rice" }
    ]
  },
  fish: {
    category: "মাছ ও সামুদ্রিক খাবার",
    items: [
      { name: "ইলিশ মাছ", carbs: 0, portion: "১ টুকরা", calories: 150, category: "fish" },
      { name: "রুই মাছ", carbs: 0, portion: "১ টুকরা", calories: 120, category: "fish" },
      { name: "কাতলা মাছ", carbs: 0, portion: "১ টুকরা", calories: 140, category: "fish" },
      { name: "পাঙ্গাশ মাছ", carbs: 0, portion: "১ টুকরা", calories: 100, category: "fish" },
      { name: "চিংড়ি", carbs: 1, portion: "৫০ গ্রাম", calories: 85, category: "fish" },
      { name: "মাছের ঝোল", carbs: 5, portion: "১ বাটি", calories: 120, category: "fish" }
    ]
  },
  meat: {
    category: "মাংস ও পোল্ট্রি",
    items: [
      { name: "গরুর মাংস", carbs: 0, portion: "১০০ গ্রাম", calories: 250, category: "meat" },
      { name: "খাসির মাংস", carbs: 0, portion: "১০০ গ্রাম", calories: 280, category: "meat" },
      { name: "মুরগির মাংস", carbs: 0, portion: "১০০ গ্রাম", calories: 165, category: "meat" },
      { name: "কলিজা", carbs: 3, portion: "১০০ গ্রাম", calories: 135, category: "meat" },
      { name: "মুরগির ডিম", carbs: 1, portion: "১টি", calories: 70, category: "meat" },
      { name: "কোরমা", carbs: 8, portion: "১ বাটি", calories: 300, category: "meat" }
    ]
  },
  vegetables: {
    category: "সবজি ও তরকারি",
    items: [
      { name: "আলু ভর্তা", carbs: 20, portion: "১ বাটি", calories: 120, category: "vegetables" },
      { name: "বেগুন ভর্তা", carbs: 8, portion: "১ বাটি", calories: 80, category: "vegetables" },
      { name: "পালং শাক", carbs: 4, portion: "১ বাটি", calories: 25, category: "vegetables" },
      { name: "লাউ শাক", carbs: 5, portion: "১ বাটি", calories: 30, category: "vegetables" },
      { name: "করলা ভাজি", carbs: 6, portion: "১ বাটি", calories: 45, category: "vegetables" },
      { name: "আলু ভাজি", carbs: 25, portion: "১ বাটি", calories: 150, category: "vegetables" },
      { name: "ঢেঁড়শ ভাজি", carbs: 8, portion: "১ বাটি", calories: 60, category: "vegetables" },
      { name: "কাঁচকলা তরকারি", carbs: 15, portion: "১ বাটি", calories: 90, category: "vegetables" }
    ]
  },
  lentils: {
    category: "ডাল ও বিন",
    items: [
      { name: "মসুর ডাল", carbs: 18, portion: "১ বাটি", calories: 115, category: "lentils" },
      { name: "মুগ ডাল", carbs: 15, portion: "১ বাটি", calories: 105, category: "lentils" },
      { name: "চানা ডাল", carbs: 20, portion: "১ বাটি", calories: 125, category: "lentils" },
      { name: "অড়হর ডাল", carbs: 22, portion: "১ বাটি", calories: 130, category: "lentils" },
      { name: "খেসারি ডাল", carbs: 19, portion: "১ বাটি", calories: 120, category: "lentils" }
    ]
  },
  snacks: {
    category: "নাস্তা ও স্ন্যাকস",
    items: [
      { name: "পিঠা", carbs: 35, portion: "১টি", calories: 180, category: "snacks" },
      { name: "চানাচুর", carbs: 25, portion: "৫০ গ্রাম", calories: 200, category: "snacks" },
      { name: "মুড়ি", carbs: 20, portion: "১ কাপ", calories: 90, category: "snacks" },
      { name: "সিঙাড়া", carbs: 30, portion: "১টি", calories: 150, category: "snacks" },
      { name: "সমুচা", carbs: 28, portion: "১টি", calories: 140, category: "snacks" },
      { name: "জিলাপি", carbs: 40, portion: "১টি", calories: 200, category: "snacks" },
      { name: "রসগোল্লা", carbs: 25, portion: "১টি", calories: 120, category: "snacks" },
      { name: "পায়েস", carbs: 35, portion: "১ বাটি", calories: 180, category: "snacks" }
    ]
  },
  breakfast: {
    category: "নাস্তার খাবার",
    items: [
      { name: "রুটি", carbs: 15, portion: "১টি", calories: 80, category: "breakfast" },
      { name: "পরোটা", carbs: 25, portion: "১টি", calories: 150, category: "breakfast" },
      { name: "নান রুটি", carbs: 30, portion: "১টি", calories: 180, category: "breakfast" },
      { name: "ডাল পুরি", carbs: 35, portion: "১টি", calories: 200, category: "breakfast" },
      { name: "হালুয়া", carbs: 45, portion: "১ বাটি", calories: 250, category: "breakfast" },
      { name: "চা (চিনি সহ)", carbs: 5, portion: "১ কাপ", calories: 25, category: "breakfast" },
      { name: "চা (চিনি ছাড়া)", carbs: 0, portion: "১ কাপ", calories: 5, category: "breakfast" }
    ]
  },
  fruits: {
    category: "ফল ও ফলের রস",
    items: [
      { name: "আম", carbs: 25, portion: "১টি মাঝারি", calories: 100, category: "fruits" },
      { name: "কলা", carbs: 27, portion: "১টি", calories: 110, category: "fruits" },
      { name: "আপেল", carbs: 25, portion: "১টি মাঝারি", calories: 95, category: "fruits" },
      { name: "পেয়ারা", carbs: 15, portion: "১টি", calories: 65, category: "fruits" },
      { name: "কমলা", carbs: 15, portion: "১টি", calories: 60, category: "fruits" },
      { name: "আনারস", carbs: 20, portion: "১ স্লাইস", calories: 80, category: "fruits" },
      { name: "তরমুজ", carbs: 12, portion: "১ কাপ", calories: 50, category: "fruits" },
      { name: "ডাবের পানি", carbs: 8, portion: "১ গ্লাস", calories: 35, category: "fruits" }
    ]
  }
};

export const getFoodSuggestions = (query: string): FoodItem[] => {
  const allFoods = Object.values(bangladeshiFoods).flatMap(category => category.items);
  return allFoods.filter(food => 
    food.name.includes(query) || 
    food.name.toLowerCase().includes(query.toLowerCase())
  );
};

export const getFoodsByCategory = (category: string): FoodItem[] => {
  return bangladeshiFoods[category]?.items || [];
};

export const getAllFoods = (): FoodItem[] => {
  return Object.values(bangladeshiFoods).flatMap(category => category.items);
};
