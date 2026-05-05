import { Facebook, Twitter, Instagram, Youtube, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#050505] pt-20 pb-10 px-6 md:px-16" dir="rtl">
      <div className="flex gap-6 mb-8 justify-center md:justify-start">
        <a href="#" className="text-white hover:text-gray-400 transition-colors"><Facebook size={24} /></a>
        <a href="#" className="text-white hover:text-gray-400 transition-colors"><Instagram size={24} /></a>
        <a href="#" className="text-white hover:text-gray-400 transition-colors"><Twitter size={24} /></a>
        <a href="#" className="text-white hover:text-gray-400 transition-colors"><Youtube size={24} /></a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        <ul className="space-y-3">
          <li><a href="#" className="text-gray-500 hover:underline text-sm font-light">پەیوەندی بە ئێمە بکە</a></li>
          <li><a href="#" className="text-gray-500 hover:underline text-sm font-light">مەرجەکانی بەکارهێنان</a></li>
          <li><a href="#" className="text-gray-500 hover:underline text-sm font-light">سیاسەتی پاراستنی زانیاری</a></li>
          <li><a href="#" className="text-gray-500 hover:underline text-sm font-light">دەربارەی زانیم</a></li>
        </ul>
        <ul className="space-y-3">
          <li><a href="#" className="text-gray-500 hover:underline text-sm font-light">ناوەندی هاریکاری</a></li>
          <li><a href="#" className="text-gray-500 hover:underline text-sm font-light">کارتەکانی دیاری</a></li>
          <li><a href="#" className="text-gray-500 hover:underline text-sm font-light">پەیوەندییەکان</a></li>
          <li><a href="#" className="text-gray-500 hover:underline text-sm font-light">ڕێکخستنەکانی کووکی</a></li>
        </ul>
        <ul className="space-y-3">
          <li><a href="#" className="text-gray-500 hover:underline text-sm font-light">هەلی کار</a></li>
          <li><a href="#" className="text-gray-500 hover:underline text-sm font-light">داواکاری کڕین</a></li>
          <li><a href="#" className="text-gray-500 hover:underline text-sm font-light">زانیاری یاسایی</a></li>
          <li><a href="#" className="text-gray-500 hover:underline text-sm font-light">پەیوەندی لەگەڵ میدیا</a></li>
        </ul>
      </div>

      <div className="border border-gray-800 p-2 w-max text-xs text-gray-500 mb-6">
        کۆدی خزمەتگوزاری
      </div>

      <p className="text-xs text-gray-600">
        © ٢٠٢٤ - ٢٠٢٦ زانیم. هەموو مافەکان پارێزراوە.
      </p>
    </footer>
  );
}
