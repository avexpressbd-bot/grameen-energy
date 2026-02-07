
import { Category, Product, BlogPost } from '../types';

export const products: Product[] = [
  {
    id: '1',
    name: '100W Monocrystalline Solar Panel',
    nameBn: '১০০ ওয়াট মনোক্রিস্টালাইন সোলার প্যানেল',
    category: Category.Solar,
    price: 8500,
    discountPrice: 7800,
    image: 'https://images.unsplash.com/photo-1509391366360-fe5bb58583bb?auto=format&fit=crop&q=80&w=400',
    description: 'High efficiency solar panel for home and office use.',
    descriptionBn: 'বাসা এবং অফিসের জন্য উচ্চ ক্ষমতাসম্পন্ন সোলার প্যানেল।',
    isBestSeller: true,
    isOffer: true,
    warranty: '20 Years',
    specs: { 'Wattage': '100W', 'Type': 'Mono' },
    stock: 12
  },
  {
    id: '2',
    name: 'Rahimafrooz 1000VA IPS',
    nameBn: 'রহিমাফরোজ ১০০০ভিএ আইপিএস',
    category: Category.IPS,
    price: 15500,
    image: 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?auto=format&fit=crop&q=80&w=400',
    description: 'Pure sine wave IPS with high efficiency.',
    descriptionBn: 'উচ্চ ক্ষমতাসম্পন্ন পিওর সাইন ওয়েভ আইপিএস।',
    isBestSeller: true,
    warranty: '2 Years Replacement',
    specs: { 'Capacity': '1000VA', 'Load': '5 Fans, 10 Lights' },
    stock: 4
  },
  {
    id: '3',
    name: 'Super Star 12W LED Bulb',
    nameBn: 'সুপার স্টার ১২ ওয়াট এলইডি বাল্ব',
    category: Category.LED,
    price: 350,
    discountPrice: 280,
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=400',
    description: 'Energy saving bright LED bulb.',
    descriptionBn: 'বিদ্যুৎ সাশ্রয়ী উজ্জ্বল এলইডি বাল্ব।',
    isOffer: true,
    warranty: '1 Year Guaranteed',
    specs: { 'Wattage': '12W', 'Life': '25,000 Hours' },
    stock: 50
  },
  {
    id: '4',
    name: 'Hamko 150Ah Solar Battery',
    nameBn: 'হামকো ১৫০এএইচ সোলার ব্যাটারি',
    category: Category.Battery,
    price: 18000,
    image: 'https://images.unsplash.com/photo-1611348586804-61bf6c080437?auto=format&fit=crop&q=80&w=400',
    description: 'Deep cycle battery specialized for solar systems.',
    descriptionBn: 'সোলার সিস্টেমের জন্য বিশেষায়িত ডিপ সাইকেল ব্যাটারি।',
    isBestSeller: true,
    warranty: '30 Months (Replacement)',
    specs: { 'Capacity': '150Ah', 'Type': 'Tall Tubular' },
    stock: 8
  }
];

export const blogPosts: BlogPost[] = [
  {
    id: 'b1',
    title: 'How to choose the right IPS for your home',
    titleBn: 'আপনার বাসার জন্য সঠিক আইপিএস কিভাবে নির্বাচন করবেন',
    excerpt: 'Calculate your load and pick the best inverter.',
    excerptBn: 'আপনার লোড হিসাব করুন এবং সেরা ইনভার্টার বেছে নিন।',
    date: '2024-05-15',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=400'
  }
];
