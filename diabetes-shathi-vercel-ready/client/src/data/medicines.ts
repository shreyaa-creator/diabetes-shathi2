export interface MedicineItem {
  name: string;
  type: string;
  commonDose: string;
  category: string;
}

export const diabetesMedicines: Record<string, { category: string; items: MedicineItem[] }> = {
  insulin: {
    category: "ইনসুলিন",
    items: [
      { name: "হিউমুলিন এন", type: "দীর্ঘমেয়াদী", commonDose: "10-20 ইউনিট", category: "insulin" },
      { name: "নোভোরেপিড", type: "দ্রুত কার্যকর", commonDose: "5-15 ইউনিট", category: "insulin" },
      { name: "ল্যান্টাস", type: "দীর্ঘমেয়াদী", commonDose: "10-25 ইউনিট", category: "insulin" },
      { name: "হিউমালগ", type: "দ্রুত কার্যকর", commonDose: "5-12 ইউনিট", category: "insulin" }
    ]
  },
  tablets: {
    category: "ট্যাবলেট",
    items: [
      { name: "মেটফরমিন", type: "বিগুয়ানাইড", commonDose: "500-1000 মি.গ্রা.", category: "tablets" },
      { name: "গ্লিবেনক্লামাইড", type: "সালফোনাইল ইউরিয়া", commonDose: "2.5-5 মি.গ্রা.", category: "tablets" },
      { name: "গ্লিক্লাজাইড", type: "সালফোনাইল ইউরিয়া", commonDose: "40-80 মি.গ্রা.", category: "tablets" },
      { name: "পায়োগ্লিটাজোন", type: "থায়াজোলিডিনডায়োন", commonDose: "15-30 মি.গ্রা.", category: "tablets" },
      { name: "সিটাগ্লিপটিন", type: "ডিপিপি-4 ইনহিবিটর", commonDose: "100 মি.গ্রা.", category: "tablets" },
      { name: "এমপ্যাগ্লিফ্লোজিন", type: "এসজিএলটি-2 ইনহিবিটর", commonDose: "10-25 মি.গ্রা.", category: "tablets" }
    ]
  },
  combinations: {
    category: "কম্বিনেশন ওষুধ",
    items: [
      { name: "গ্লিমেট", type: "গ্লিমেপিরাইড + মেটফরমিন", commonDose: "1-2 ট্যাবলেট", category: "combinations" },
      { name: "ডায়াবেকন", type: "হার্বাল", commonDose: "1-2 ট্যাবলেট", category: "combinations" },
      { name: "গ্যালভাস মেট", type: "ভিলডাগ্লিপটিন + মেটফরমিন", commonDose: "1 ট্যাবলেট", category: "combinations" }
    ]
  }
};

export const getMedicineSuggestions = (query: string): MedicineItem[] => {
  const allMedicines = Object.values(diabetesMedicines).flatMap(category => category.items);
  return allMedicines.filter(medicine => 
    medicine.name.includes(query) || 
    medicine.name.toLowerCase().includes(query.toLowerCase())
  );
};

export const getMedicinesByCategory = (category: string): MedicineItem[] => {
  return diabetesMedicines[category]?.items || [];
};

export const getAllMedicines = (): MedicineItem[] => {
  return Object.values(diabetesMedicines).flatMap(category => category.items);
};
