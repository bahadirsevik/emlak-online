import { useState } from 'react';
import { Home, MapPin, Banknote, Star, Wand2, Loader2 } from 'lucide-react';

interface PropertyDetails {
  type: string;
  title: string;
  price: string;
  location: string;
  rooms: string;
  features: string;
}

interface PropertyDetailsFormProps {
  onCaptionGenerated: (caption: string) => void;
  imageAnalysis?: string;
}

export default function PropertyDetailsForm({ onCaptionGenerated, imageAnalysis }: PropertyDetailsFormProps) {
  const [details, setDetails] = useState<PropertyDetails>({
    type: 'Satılık',
    title: '',
    price: '',
    location: '',
    rooms: '',
    features: ''
  });
  const [tone, setTone] = useState('Professional');
  const [loading, setLoading] = useState(false);

  const tones = [
    { value: 'Professional', label: 'Kurumsal (Ciddi & Güvenilir)' },
    { value: 'Friendly', label: 'Samimi (Sıcak & Davetkar)' },
    { value: 'Fun', label: 'Eğlenceli (Enerjik & Emoji Bol)' },
    { value: 'Inspiring', label: 'İlham Verici (Hikaye Odaklı)' },
    { value: 'Minimal', label: 'Minimal (Kısa & Öz)' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGenerate = async () => {
    if (!details.title || !details.price) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/ai/generate-caption`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          type: 'real-estate',
          language: 'Turkish',
          tone,
          details,
          imageAnalysis
        }),
      });

      if (!response.ok) throw new Error('Failed to generate');

      const data = await response.json();
      
      // Generate hashtags based on property type and location
      const hashtagTopic = `Real Estate ${details.type} ${details.location} ${details.title}`;
      const hashtagResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/ai/generate-hashtags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ topic: hashtagTopic, language: 'Turkish' }),
      });
      
      let finalCaption = data.caption;
      if (hashtagResponse.ok) {
        const hashtagData = await hashtagResponse.json();
        finalCaption += `\n\n${hashtagData.hashtags}`;
      }

      onCaptionGenerated(finalCaption);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate caption. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-indigo-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-2 text-indigo-700">
        <Home className="h-6 w-6" />
        <h3 className="text-lg font-semibold">Emlak Detayları</h3>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">İlan Tipi</label>
            <select
              name="type"
              value={details.type}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 p-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="Satılık">Satılık</option>
              <option value="Kiralık">Kiralık</option>
              <option value="Devren">Devren</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Ton</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full rounded-md border-gray-300 p-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {tones.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">İlan Başlığı</label>
          <input
            type="text"
            name="title"
            value={details.title}
            onChange={handleChange}
            placeholder="Örn: Deniz Manzaralı Lüks Daire"
            className="w-full rounded-md border-gray-300 p-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Fiyat</label>
            <div className="relative">
              <Banknote className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                name="price"
                value={details.price}
                onChange={handleChange}
                placeholder="5.000.000 TL"
                className="w-full rounded-md border-gray-300 pl-8 p-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Konum (İlçe/Semt)</label>
            <div className="relative">
              <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                name="location"
                value={details.location}
                onChange={handleChange}
                placeholder="Kadıköy, Moda"
                className="w-full rounded-md border-gray-300 pl-8 p-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Oda Sayısı</label>
            <input
              type="text"
              name="rooms"
              value={details.rooms}
              onChange={handleChange}
              placeholder="Örn: 3+1"
              className="w-full rounded-md border-gray-300 p-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
             {/* Empty for alignment or future use */}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Özellikler (Virgülle ayırın)</label>
          <div className="relative">
            <Star className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <textarea
              name="features"
              value={details.features}
              onChange={handleChange}
              rows={3}
              placeholder="Havuzlu, Güvenlik, Metroya yakın, Balkonlu..."
              className="w-full rounded-md border-gray-300 pl-8 p-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !details.title}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              AI Metin Oluşturuluyor...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" />
              AI ile Profesyonel Metin Oluştur
            </>
          )}
        </button>
      </div>
    </div>
  );
}
