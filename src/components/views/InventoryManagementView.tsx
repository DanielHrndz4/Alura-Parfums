import React, { useState, useRef } from 'react';
import { Perfume, OlfactoryFamily, GenderStyle } from '../../types/perfume';
import { PerfumeRepository } from '../../repositories/perfumeRepository';
import { GeminiService, GeminiFragranceResult } from '../../services/geminiService';
import { ImageStorageService, SUPABASE_PERFUMES_BUCKET } from '../../services/imageStorageService';

export const InventoryManagementView: React.FC = () => {
  const [perfumes, setPerfumes] = useState(PerfumeRepository.getAll());
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => GeminiService.getApiKey());
  const [notification, setNotification] = useState<string | null>(null);

  // Gemini Search state
  const [geminiQuery, setGeminiQuery] = useState('');
  const [isSearchingGemini, setIsSearchingGemini] = useState(false);
  const [geminiSearchSuccess, setGeminiSearchSuccess] = useState<string | null>(null);

  // Form state
  const [newName, setNewName] = useState('');
  const [newHouse, setNewHouse] = useState('');
  const [newFamily, setNewFamily] = useState<OlfactoryFamily>('Amaderado');
  const [newCapacity, setNewCapacity] = useState<'100ml' | '50ml'>('100ml');
  const [newConcentration, setNewConcentration] = useState('Eau de Parfum');
  const [newGender, setNewGender] = useState<GenderStyle>('unisex');
  const [newPrice, setNewPrice] = useState(15.0); // Standard $15 for 100ml
  const [newStock, setNewStock] = useState(3);
  const [newHasSample, setNewHasSample] = useState(true);
  const [newDescription, setNewDescription] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isSearchingImage, setIsSearchingImage] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageStorageStatus, setImageStorageStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [topNotes, setTopNotes] = useState<string[]>([]);
  const [heartNotes, setHeartNotes] = useState<string[]>([]);
  const [baseNotes, setBaseNotes] = useState<string[]>([]);
  const [accords, setAccords] = useState<{ name: string; percentage: number }[]>([]);

  const [perfumeToDelete, setPerfumeToDelete] = useState<Perfume | null>(null);

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const confirmDeletePerfume = () => {
    if (!perfumeToDelete) return;
    PerfumeRepository.delete(perfumeToDelete.id);
    setPerfumes(PerfumeRepository.getAll());
    showNotify(`"${perfumeToDelete.name}" ha sido eliminado del catálogo.`);
    setPerfumeToDelete(null);
  };

  const handleCapacityChange = (cap: '100ml' | '50ml') => {
    setNewCapacity(cap);
    // Enforce brand pricing rules: $15 for 100ml, $10 for 50ml
    setNewPrice(cap === '100ml' ? 15.0 : 10.0);
  };

  const handleStockDelta = (id: string, delta: number) => {
    PerfumeRepository.updateStock(id, delta);
    setPerfumes(PerfumeRepository.getAll());
  };

  // Upload own local image, resize to 1000x1000 and save to Supabase Storage
  const handleLocalFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setImageStorageStatus('Formateando a 1000x1000 y subiendo al bucket Supabase...');

    try {
      const perfumeIdentifier = newName.trim() || geminiQuery.trim() || 'flacon';
      const result = await ImageStorageService.processAndStoreImage(file, perfumeIdentifier);

      setNewImageUrl(result.url);

      if (result.uploadedToStorage) {
        setImageStorageStatus(`✓ 1000x1000 guardada en bucket "${SUPABASE_PERFUMES_BUCKET}" de Supabase`);
        showNotify(`📸 Imagen propia (1000x1000) guardada en Supabase Storage.`);
      } else {
        setImageStorageStatus(`✓ Formateada a 1000x1000 en canvas local`);
        showNotify(`📸 Imagen propia formateada a 1000x1000.`);
      }
    } catch (err: any) {
      showNotify(`Error al procesar la imagen: ${err.message || 'Error desconocido'}`);
      setImageStorageStatus(null);
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Dedicated AI-assisted Bottle Image Search (formatted to 1000x1000 & saved to Supabase)
  const handleSearchImage = async () => {
    const targetName = newName.trim() || geminiQuery.trim();
    if (!targetName) {
      showNotify('Ingresa primero el nombre de la fragancia para buscar su fotografía.');
      return;
    }

    setIsSearchingImage(true);
    setImageStorageStatus('Buscando frasco y formateando a 1000x1000 en Supabase...');
    try {
      const foundImage = await GeminiService.findFragranceImage(targetName, newHouse, newFamily);
      if (foundImage) {
        const result = await ImageStorageService.processAndStoreImage(foundImage, targetName);
        setNewImageUrl(result.url);

        if (result.uploadedToStorage) {
          setImageStorageStatus(`✓ 1000x1000 guardada en bucket "${SUPABASE_PERFUMES_BUCKET}" de Supabase`);
          showNotify(`📸 Foto encontrada por IA, escalada a 1000x1000 y guardada en Supabase Storage.`);
        } else {
          setImageStorageStatus(`✓ Formateada a 1000x1000 en vitrina`);
          showNotify(`📸 Imagen identificada para "${targetName}".`);
        }
      } else {
        showNotify('No se encontró una foto automática. Puedes subir tu propia imagen.');
      }
    } catch {
      showNotify('Error al buscar la fotografía del perfume.');
    } finally {
      setIsSearchingImage(false);
    }
  };

  // AI-assisted Fragrance Lookup with Gemini
  const handleSearchWithGemini = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = geminiQuery.trim() || newName.trim();
    if (!query) {
      showNotify('Por favor escribe el nombre de un perfume para que Gemini lo investigue.');
      return;
    }

    setIsSearchingGemini(true);
    setGeminiSearchSuccess(null);

    try {
      const data: GeminiFragranceResult = await GeminiService.searchFragrance(query);

      // Populate form fields
      setNewName(data.name);
      setNewHouse(data.house);
      setNewFamily(data.family);
      setNewConcentration(data.concentration);
      setNewGender(data.gender);
      setNewDescription(data.description);
      setTopNotes(data.notes.top || []);
      setHeartNotes(data.notes.heart || []);
      setBaseNotes(data.notes.base || []);
      setAccords(data.accords || []);

      if (data.format.includes('50ml')) {
        handleCapacityChange('50ml');
      } else {
        handleCapacityChange('100ml');
      }

      if (data.suggestedImageUrl) {
        try {
          setImageStorageStatus('Formateando foto a 1000x1000 para Supabase...');
          const result = await ImageStorageService.processAndStoreImage(data.suggestedImageUrl, data.name);
          setNewImageUrl(result.url);
          if (result.uploadedToStorage) {
            setImageStorageStatus(`✓ 1000x1000 guardada en bucket "${SUPABASE_PERFUMES_BUCKET}" de Supabase`);
          } else {
            setImageStorageStatus('✓ Formateada a 1000x1000 para vitrina');
          }
        } catch {
          setNewImageUrl(data.suggestedImageUrl);
        }
      }

      const sourceBadge = data.source === 'gemini-api' ? 'Gemini AI Live' : 'Enciclopedia Olfativa';
      setGeminiSearchSuccess(`Información de "${data.name}" cargada con éxito vía ${sourceBadge}.`);
      showNotify(`✨ Datos investigados por Gemini para "${data.name}".`);
    } catch (err: any) {
      showNotify(`Error al consultar Gemini: ${err.message || 'Intente nuevamente'}`);
    } finally {
      setIsSearchingGemini(false);
    }
  };

  const handleSaveApiKey = () => {
    GeminiService.setApiKey(apiKeyInput);
    setIsApiKeyModalOpen(false);
    showNotify('Clave de API de Gemini guardada correctamente.');
  };

  const handleAddPerfume = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newHouse) return;

    const formatLabel = `${newCapacity} • ${newConcentration}`;
    const newFlacon: Perfume = {
      id: `p-${Date.now()}`,
      name: newName,
      house: newHouse,
      subtitle: `${newFamily} • ${formatLabel}`,
      gender: newGender,
      price: newCapacity === '100ml' ? 15.0 : 10.0,
      stock: newStock,
      hasSample: newHasSample,
      samplePrice: 10.0,
      format: formatLabel,
      description: newDescription || 'Creación artesanal ingresada a la vitrina de Alura Parfums.',
      family: newFamily,
      imageUrl:
        newImageUrl ||
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBIbXAjfBXcFy-gZ6ZyVZ33BhhVQLnkxF19TxLza72qtz0F-yz9JHJNPU2GYUyA72Ki5ORXLFnMRVOhMSoP9cFr_awMgbeOKU0FWbXpkjohOCdaal_OVCN7qp7uRzIxit5tVG7IEjlyfyMmojWaCUC3DO5871CqKe-MLvaHqDdpsfuf24Jix8bkJxS-eHYJ64MOAcKZzKuVNDBQeOb5reAauHbzUGCsd6io5FbRZbDj',
      imageAlt: newName,
      notes: {
        top: topNotes,
        heart: heartNotes,
        base: baseNotes,
      },
      accords: accords,
    };

    const updated = [newFlacon, ...perfumes];
    PerfumeRepository.save(updated);
    setPerfumes(PerfumeRepository.getAll());
    setIsModalOpen(false);

    // Reset form
    setGeminiQuery('');
    setNewName('');
    setNewHouse('');
    setNewDescription('');
    setNewImageUrl('');
    setImageStorageStatus(null);
    setTopNotes([]);
    setHeartNotes([]);
    setBaseNotes([]);
    setAccords([]);
    setGeminiSearchSuccess(null);

    showNotify(`"${newName}" ingresado al catálogo de vitrina exitosamente.`);
  };

  const filtered = perfumes.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.house.toLowerCase().includes(search.toLowerCase()) ||
      p.family.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Page Header */}
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-6 border-b border-[#E6DED1]/80 mb-6">
        <div>
          <div className="flex items-center gap-2 text-[#6E665F] font-label-sm uppercase tracking-widest text-xs font-bold">
            <span>Inventario Central</span>
            <span className="text-[#c59b27]">•</span>
            <span>Catálogo Maestro de Vitrina</span>
          </div>
          <h1 className="font-headline-lg text-[#1A1817] tracking-tight font-serif text-3xl font-semibold mt-1">
            Inventario &amp; Libro de Flacons
          </h1>
          <p className="font-body-md text-[#6E665F] text-sm mt-1">
            Registro de frascos sellados, niveles de existencias y control asistido por Gemini AI.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsApiKeyModalOpen(true)}
            className="px-3.5 py-2.5 sm:py-2 rounded-none bg-white hover:bg-[#FAF8F5] text-[#6E665F] hover:text-[#1A1817] text-xs font-semibold border border-[#E6DED1] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            title="Configurar clave de Gemini AI"
          >
            <span className="material-symbols-outlined text-[16px] text-[#c59b27]">smart_toy</span>
            <span>Configurar Gemini</span>
          </button>

          <button
            onClick={() => {
              setIsModalOpen(true);
              setGeminiSearchSuccess(null);
            }}
            className="px-5 py-2.5 rounded-none bg-[#c59b27] hover:bg-[#D4AF37] text-[#1A1817] font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>+ Registrar Frasco con Gemini</span>
          </button>
        </div>
      </header>

      {/* Search and Table */}
      <div className="bg-white rounded-none shadow-xs border border-[#E6DED1] overflow-hidden mb-8">
        <div className="p-4 bg-[#F5F2EB]/50 border-b border-[#E6DED1] flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#6E665F]">
              search
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por fragancia, casa o familia..."
              className="w-full bg-white pl-9 pr-3 py-2 rounded-none border border-[#E6DED1] text-xs outline-none focus:border-[#c59b27]"
            />
          </div>
          <div className="text-xs text-[#6E665F]">
            Total en Vitrina: <strong>{perfumes.reduce((acc, p) => acc + p.stock, 0)} unidades</strong>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F5F2EB] text-[#6E665F] font-label-md uppercase">
                <th className="py-3 px-4 font-semibold">Fragancia</th>
                <th className="py-3 px-4 font-semibold">Maison</th>
                <th className="py-3 px-4 font-semibold">Formato</th>
                <th className="py-3 px-4 font-semibold">Familia</th>
                <th className="py-3 px-4 text-right font-semibold">Precio USD</th>
                <th className="py-3 px-4 text-center font-semibold">Tester / Muestra</th>
                <th className="py-3 px-4 text-center font-semibold">Stock Vitrina</th>
                <th className="py-3 px-4 text-center font-semibold">Eliminar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F2EB] text-[#2C2826]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#6E665F]">
                    <span className="material-symbols-outlined text-4xl text-[#6E665F]/40 mb-2 block">
                      inventory_2
                    </span>
                    <p className="font-semibold text-xs text-[#1A1817]">No se encontraron fragancias registradas</p>
                    <p className="text-[11px] text-[#6E665F] mt-1">
                      Usa el botón superior "+ Ingresar con Gemini" para registrar nuevas creaciones en tiempo real en Supabase.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F5F2EB]/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[#1A1817]">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-white border border-[#E6DED1] overflow-hidden shrink-0 flex items-center justify-center p-0.5 shadow-2xs">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=300&q=80';
                            }}
                          />
                        </div>
                        <div>
                          <span>{item.name}</span>
                          {item.notes?.top && item.notes.top.length > 0 && (
                            <span className="block text-[10px] text-[#6E665F] truncate max-w-xs font-normal">
                              Salida: {item.notes.top.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#6E665F] font-medium">{item.house}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs font-semibold">{item.format}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-none bg-[#F5F2EB] text-[#775a00] font-semibold text-[10px] border border-[#E6DED1]">
                        {item.family}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-[#1A1817]">
                      ${item.price.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {item.hasSample ? (
                        <span className="inline-block px-3 py-1 rounded-none bg-[#F0F5EE] text-[#2D5A27] font-bold text-[11px] border border-[#2D5A27]/25 tracking-wide whitespace-nowrap">
                          SÍ
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 rounded-none bg-[#FAF0EF] text-[#8A2E2B] font-bold text-[11px] border border-[#8A2E2B]/25 tracking-wide whitespace-nowrap">
                          NO
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-2 bg-[#F5F2EB] p-1 rounded-none border border-[#E6DED1]">
                        <button
                          onClick={() => handleStockDelta(item.id, -1)}
                          className="w-5 h-5 rounded-none bg-white hover:bg-[#ECE7DE] text-[#1A1817] font-bold flex items-center justify-center cursor-pointer shadow-xs"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold text-xs w-6 text-center">{item.stock}</span>
                        <button
                          onClick={() => handleStockDelta(item.id, 1)}
                          className="w-5 h-5 rounded-none bg-white hover:bg-[#ECE7DE] text-[#1A1817] font-bold flex items-center justify-center cursor-pointer shadow-xs"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setPerfumeToDelete(item)}
                        className="w-7 h-7 rounded-none bg-white hover:bg-[#FAF0EF] text-[#8A2E2B] border border-[#E6DED1] hover:border-[#8A2E2B]/40 inline-flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                        title={`Eliminar "${item.name}"`}
                      >
                        <span className="material-symbols-outlined text-[15px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Perfume Assisted by Gemini AI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1817]/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-none shadow-2xl border border-[#E6DED1] overflow-hidden max-h-[92vh] flex flex-col animate-fadeIn">
            {/* Modal Header */}
            <div className="p-5 bg-[#F5F2EB] border-b border-[#E6DED1] flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#c59b27] text-2xl">auto_awesome</span>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#c59b27] tracking-widest block">
                    Catalogación Asistida por IA
                  </span>
                  <h3 className="font-serif text-lg font-bold text-[#1A1817]">
                    Registrar Nuevo Frasco con Gemini AI
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-none bg-white hover:bg-neutral-200 text-[#2C2826] flex items-center justify-center transition-colors cursor-pointer border border-[#E6DED1]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              {/* Gemini AI Search Bar */}
              <div className="p-4 bg-gradient-to-r from-[#FAF8F5] to-[#F5F2EB] border-2 border-[#c59b27]/40 shadow-xs">
                <label className="block text-xs font-bold text-[#1A1817] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#c59b27]">psychology</span>
                    Enlace de Fragrantica o Nombre del Perfume (Tonos &amp; Fotos 1000x1000)
                  </span>
                  <span className="text-[10px] text-[#6E665F] font-normal">Soporta fragrantica.es y nombres comerciales</span>
                </label>

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-[#6E665F]">
                      search
                    </span>
                    <input
                      type="text"
                      value={geminiQuery}
                      onChange={(e) => setGeminiQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSearchWithGemini();
                        }
                      }}
                      placeholder="Pega un enlace de Fragrantica (ej. https://www.fragrantica.es/...) o escribe Valentino Born in Roma..."
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E6DED1] rounded-none text-xs font-medium text-[#1A1817] placeholder:text-[#9C948A] focus:outline-hidden focus:border-[#c59b27]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSearchWithGemini()}
                    disabled={isSearchingGemini}
                    className={`px-4 py-2.5 bg-[#c59b27] hover:bg-[#D4AF37] text-[#1A1817] font-bold text-xs rounded-none transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs shrink-0 ${
                      isSearchingGemini ? 'opacity-70 cursor-wait' : ''
                    }`}
                  >
                    {isSearchingGemini ? (
                      <>
                        <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                        <span>Investigando...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                        <span>Investigar con Gemini</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Gemini feedback message */}
                {geminiSearchSuccess && (
                  <div className="mt-2.5 p-2 bg-[#F0F5EE] border border-[#2D5A27]/20 text-[#2D5A27] text-[11px] font-medium flex items-center gap-1.5 animate-fadeIn">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    {geminiSearchSuccess}
                  </div>
                )}
              </div>

              {/* Main Product Details Form */}
              <form id="add-perfume-form" onSubmit={handleAddPerfume} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-[#1A1817] font-bold uppercase tracking-wider text-[11px] mb-1">
                      Nombre Comercial de la Fragancia *
                    </label>
                    <input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      required
                      placeholder="Ej. Sauvage Elixir"
                      className="w-full p-2.5 bg-white border border-[#E6DED1] rounded-none outline-none focus:border-[#c59b27] text-[#1A1817] font-medium"
                    />
                  </div>

                  {/* House / Maison */}
                  <div>
                    <label className="block text-[#1A1817] font-bold uppercase tracking-wider text-[11px] mb-1">
                      Maison / Casa Fabricante *
                    </label>
                    <input
                      value={newHouse}
                      onChange={(e) => setNewHouse(e.target.value)}
                      required
                      placeholder="Ej. Dior, Creed, Lattafa"
                      className="w-full p-2.5 bg-white border border-[#E6DED1] rounded-none outline-none focus:border-[#c59b27] text-[#1A1817] font-medium"
                    />
                  </div>
                </div>

                {/* Fotografía Oficial del Frasco (1000x1000 PX • Bucket Supabase "Alura Parfums") */}
                <div className="p-4 bg-gradient-to-r from-[#FAF8F5] via-[#F8F5EE] to-[#F5F2EB] border-2 border-[#c59b27]/30 shadow-xs space-y-3">
                  {/* Hidden file input for local image upload */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLocalFileUpload}
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    className="hidden"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[17px] text-[#c59b27]">photo_camera</span>
                      <span className="text-[#1A1817] font-bold uppercase tracking-wider text-[11px]">
                        Fotografía del Frasco (1000 × 1000 px)
                      </span>
                      <span className="px-1.5 py-0.5 bg-[#FAF0D7] text-[#775a00] border border-[#c59b27]/40 text-[9px] font-bold uppercase tracking-wider">
                        1000×1000 HD
                      </span>
                      <span className="px-1.5 py-0.5 bg-[#F0F5EE] text-[#2D5A27] border border-[#2D5A27]/30 text-[9px] font-bold uppercase tracking-wider">
                        Bucket: Alura Parfums
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Local File Upload Button */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingImage || isSearchingImage}
                        className="px-2.5 py-1 bg-white hover:bg-[#FAF8F5] text-[#1A1817] border border-[#c59b27] font-bold text-[11px] rounded-none transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                        title="Subir archivo desde tu ordenador (se redimensionará a 1000x1000)"
                      >
                        <span className={`material-symbols-outlined text-[15px] text-[#c59b27] ${isUploadingImage ? 'animate-spin' : ''}`}>
                          {isUploadingImage ? 'refresh' : 'upload_file'}
                        </span>
                        <span>{isUploadingImage ? 'Procesando...' : 'Subir Foto Propia'}</span>
                      </button>

                      {/* AI Search & Format Button */}
                      <button
                        type="button"
                        onClick={handleSearchImage}
                        disabled={isSearchingImage || isUploadingImage}
                        className={`px-2.5 py-1 bg-[#c59b27] hover:bg-[#D4AF37] text-[#1A1817] font-bold text-[11px] rounded-none transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0 ${
                          isSearchingImage ? 'opacity-70 cursor-wait' : ''
                        }`}
                        title="Buscar frasco oficial con IA y formatear a 1000x1000"
                      >
                        <span className={`material-symbols-outlined text-[15px] ${isSearchingImage ? 'animate-spin' : ''}`}>
                          {isSearchingImage ? 'refresh' : 'auto_awesome'}
                        </span>
                        <span>{isSearchingImage ? 'Buscando...' : 'Rebuscar con IA'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5">
                    {/* Interactive 1000x1000 Preview Box */}
                    <div
                      onClick={() => !newImageUrl && fileInputRef.current?.click()}
                      className={`w-20 h-20 bg-white border-2 border-[#c59b27]/50 shrink-0 flex items-center justify-center overflow-hidden shadow-xs relative group ${
                        !newImageUrl ? 'cursor-pointer hover:border-[#c59b27]' : ''
                      }`}
                      title={newImageUrl ? 'Vista previa 1000x1000' : 'Haz clic para seleccionar foto de tu equipo'}
                    >
                      {newImageUrl ? (
                        <>
                          <img
                            src={newImageUrl}
                            alt={newName || 'Frasco de perfume'}
                            className="w-full h-full object-contain p-1"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=300&q=80';
                            }}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                            className="absolute inset-0 bg-[#1A1817]/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[9px] font-semibold cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">cached</span>
                            Cambiar
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-[#9C948A] text-center p-1">
                          <span className="material-symbols-outlined text-2xl text-[#c59b27]/70">add_photo_alternate</span>
                          <span className="text-[8px] uppercase tracking-wider font-bold mt-0.5 text-[#1A1817]">Subir</span>
                        </div>
                      )}
                    </div>

                    {/* URL Input & Status Information */}
                    <div className="flex-1 space-y-1.5">
                      <div className="relative">
                        <input
                          type="url"
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          placeholder="URL o sube una imagen local (todo se procesa en 1000x1000 px)"
                          className="w-full pr-8 pl-2.5 py-2 bg-white border border-[#E6DED1] rounded-none outline-none focus:border-[#c59b27] text-[#1A1817] text-xs font-mono"
                        />
                        {newImageUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              setNewImageUrl('');
                              setImageStorageStatus(null);
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9C948A] hover:text-[#1A1817] cursor-pointer"
                            title="Eliminar imagen"
                          >
                            <span className="material-symbols-outlined text-[15px]">cancel</span>
                          </button>
                        )}
                      </div>

                      {/* Status Feedback */}
                      {imageStorageStatus ? (
                        <div className="p-1.5 bg-[#F0F5EE] border border-[#2D5A27]/25 text-[#2D5A27] text-[10px] font-semibold flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[13px]">cloud_done</span>
                          <span>{imageStorageStatus}</span>
                        </div>
                      ) : (
                        <p className="text-[10px] text-[#6E665F]">
                          {newImageUrl
                            ? '✓ Fotografía lista en formato 1000x1000. Puedes cambiarla subiendo tu propio archivo o con la IA.'
                            : 'Puedes subir una foto de tu PC o dejar que Gemini investigue y guarde el frasco en el bucket Supabase.'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Family, Concentration & Gender */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[#1A1817] font-bold uppercase tracking-wider text-[11px] mb-1">
                      Familia Olfativa
                    </label>
                    <select
                      value={newFamily}
                      onChange={(e) => setNewFamily(e.target.value as OlfactoryFamily)}
                      className="w-full p-2.5 bg-white border border-[#E6DED1] rounded-none outline-none focus:border-[#c59b27] text-[#1A1817] font-medium cursor-pointer"
                    >
                      <option value="Amaderado">Amaderado</option>
                      <option value="Floral">Floral</option>
                      <option value="Gourmand">Gourmand</option>
                      <option value="Cuero">Cuero</option>
                      <option value="Cítrico">Cítrico</option>
                      <option value="Especiado">Especiado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#1A1817] font-bold uppercase tracking-wider text-[11px] mb-1">
                      Concentración
                    </label>
                    <input
                      value={newConcentration}
                      onChange={(e) => setNewConcentration(e.target.value)}
                      placeholder="Ej. Eau de Parfum"
                      className="w-full p-2.5 bg-white border border-[#E6DED1] rounded-none outline-none focus:border-[#c59b27] text-[#1A1817]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#1A1817] font-bold uppercase tracking-wider text-[11px] mb-1">
                      Estilo / Género
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {(['unisex', 'fem', 'masc'] as GenderStyle[]).map((g) => (
                        <button
                          type="button"
                          key={g}
                          onClick={() => setNewGender(g)}
                          className={`py-2 text-[11px] font-semibold uppercase border rounded-none transition-colors cursor-pointer ${
                            newGender === g
                              ? 'bg-[#c59b27] text-[#1A1817] border-[#c59b27]'
                              : 'bg-white text-[#6E665F] border-[#E6DED1] hover:bg-[#FAF8F5]'
                          }`}
                        >
                          {g === 'unisex' ? 'Unisex' : g === 'fem' ? 'Fem' : 'Masc'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Capacity & Standard Boutique Price ($15 for 100ml / $10 for 50ml) */}
                <div className="p-3.5 bg-[#F5F2EB]/60 border border-[#E6DED1] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[11px] uppercase tracking-wider text-[#1A1817]">
                      Formato &amp; Tarifa Oficial Alura
                    </span>
                    <span className="text-[10px] text-[#6E665F]">Tarifas fijas: 100ml = $15 | 50ml = $10</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleCapacityChange('100ml')}
                      className={`p-3 border rounded-none text-left transition-all cursor-pointer ${
                        newCapacity === '100ml'
                          ? 'border-[#c59b27] bg-white shadow-xs'
                          : 'border-[#E6DED1] bg-[#FAF8F5] opacity-75'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-[#1A1817]">Frasco 100ml</span>
                        <span className="font-mono font-bold text-sm text-[#2D5A27]">$15.00 USD</span>
                      </div>
                      <span className="text-[10px] text-[#6E665F] block mt-0.5">Formato clásico de vitrina</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCapacityChange('50ml')}
                      className={`p-3 border rounded-none text-left transition-all cursor-pointer ${
                        newCapacity === '50ml'
                          ? 'border-[#c59b27] bg-white shadow-xs'
                          : 'border-[#E6DED1] bg-[#FAF8F5] opacity-75'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-[#1A1817]">Frasco 50ml</span>
                        <span className="font-mono font-bold text-sm text-[#2D5A27]">$10.00 USD</span>
                      </div>
                      <span className="text-[10px] text-[#6E665F] block mt-0.5">Formato compacto</span>
                    </button>
                  </div>
                </div>

                {/* Olfactory Pyramid (Tonos / Notas investigadas por Gemini) */}
                {(topNotes.length > 0 || heartNotes.length > 0 || baseNotes.length > 0) && (
                  <div className="p-3.5 bg-[#FAF8F5] border border-[#E6DED1] space-y-2.5">
                    <span className="font-bold text-[11px] uppercase tracking-wider text-[#1A1817] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px] text-[#c59b27]">filter_vintage</span>
                      Pirámide Olfativa Identificada por Gemini (Tonos &amp; Acordes)
                    </span>

                    <div className="space-y-2 text-[11px]">
                      {topNotes.length > 0 && (
                        <div>
                          <span className="font-bold text-[#6E665F] uppercase text-[9px] block">Notas de Salida:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {topNotes.map((note, i) => (
                              <span key={i} className="px-2 py-0.5 bg-white border border-[#E6DED1] text-[#1A1817] rounded-none">
                                {note}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {heartNotes.length > 0 && (
                        <div>
                          <span className="font-bold text-[#6E665F] uppercase text-[9px] block">Notas de Corazón:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {heartNotes.map((note, i) => (
                              <span key={i} className="px-2 py-0.5 bg-[#F5F2EB] border border-[#E6DED1] text-[#775a00] font-medium rounded-none">
                                {note}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {baseNotes.length > 0 && (
                        <div>
                          <span className="font-bold text-[#6E665F] uppercase text-[9px] block">Notas de Fondo:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {baseNotes.map((note, i) => (
                              <span key={i} className="px-2 py-0.5 bg-white border border-[#E6DED1] text-[#1A1817] rounded-none">
                                {note}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className="block text-[#1A1817] font-bold uppercase tracking-wider text-[11px] mb-1">
                    Descripción Poética &amp; Perfil Olfativo
                  </label>
                  <textarea
                    rows={2}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Descripción generada por Gemini o redactada por el atelier..."
                    className="w-full p-2.5 bg-white border border-[#E6DED1] rounded-none outline-none focus:border-[#c59b27] text-[#1A1817] text-xs"
                  />
                </div>

                {/* Stock & Tester checkbox */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-[#1A1817] font-bold uppercase tracking-wider text-[11px] mb-1">
                      Stock Inicial en Vitrina
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newStock}
                      onChange={(e) => setNewStock(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full p-2.5 bg-white border border-[#E6DED1] rounded-none font-mono font-bold text-sm text-[#1A1817] outline-none focus:border-[#c59b27]"
                    />
                  </div>

                  <div className="pt-4">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={newHasSample}
                        onChange={(e) => setNewHasSample(e.target.checked)}
                        className="w-4 h-4 text-[#c59b27] rounded-none border-[#E6DED1] cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-[#1A1817]">
                        Tester / Muestra disponible en mostrador
                      </span>
                    </label>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-3.5 sm:p-4 bg-[#FAF8F5] border-t border-[#E6DED1] flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 sm:py-2 border border-[#E6DED1] bg-white text-xs font-semibold text-[#6E665F] hover:text-[#1A1817] hover:bg-neutral-100 transition-colors rounded-none cursor-pointer flex items-center justify-center order-2 sm:order-1"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="add-perfume-form"
                className="px-5 py-2.5 sm:py-2 text-xs font-bold bg-[#c59b27] hover:bg-[#D4AF37] text-[#1A1817] transition-all rounded-none flex items-center justify-center gap-2 cursor-pointer shadow-xs order-1 sm:order-2"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                Guardar en Vitrina (${newPrice.toFixed(2)})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gemini API Key Configuration Modal */}
      {isApiKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1817]/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-none shadow-2xl border border-[#E6DED1] p-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#E6DED1]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#c59b27]">key</span>
                <h3 className="font-serif text-base font-bold text-[#1A1817]">
                  Configuración de Gemini AI API
                </h3>
              </div>
              <button
                onClick={() => setIsApiKeyModalOpen(false)}
                className="w-7 h-7 rounded-none bg-[#F5F2EB] text-[#2C2826] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#6E665F]">
              <p>
                Ingresa tu clave de API de Google Gemini (AI Studio). Esta clave se almacena de forma segura en tu navegador para realizar consultas directas al modelo:
              </p>
              <div>
                <label className="block text-[#1A1817] font-bold mb-1">GEMINI_API_KEY</label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full p-2 bg-white border border-[#E6DED1] rounded-none font-mono text-xs text-[#1A1817] focus:outline-hidden focus:border-[#c59b27]"
                />
              </div>
              <p className="text-[10px] text-[#6E665F]/80">
                Si no ingresas una clave, el sistema utiliza de forma automática la enciclopedia y base de conocimientos de alta perfumería del Atelier.
              </p>
            </div>

            <div className="mt-5 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsApiKeyModalOpen(false)}
                className="px-3.5 py-1.5 border border-[#E6DED1] text-xs font-semibold text-[#6E665F] rounded-none cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="px-4 py-1.5 bg-[#c59b27] hover:bg-[#D4AF37] text-[#1A1817] font-bold text-xs rounded-none cursor-pointer"
              >
                Guardar Clave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {perfumeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1817]/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-none shadow-2xl border border-[#E6DED1] p-5 animate-fadeIn">
            <div className="flex items-center gap-2.5 text-[#8A2E2B] mb-2 pb-2 border-b border-[#FAF0EF]">
              <span className="material-symbols-outlined text-2xl">delete_forever</span>
              <h3 className="font-serif text-base font-bold text-[#1A1817]">¿Eliminar Fragancia?</h3>
            </div>
            <p className="text-xs text-[#6E665F] mb-4">
              ¿Estás seguro de que deseas eliminar permanentemente <strong>"{perfumeToDelete.name}"</strong> ({perfumeToDelete.house}) de la vitrina y de Supabase? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPerfumeToDelete(null)}
                className="px-3.5 py-1.5 border border-[#E6DED1] text-xs font-semibold text-[#6E665F] hover:bg-[#FAF8F5] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeletePerfume}
                className="px-4 py-1.5 bg-[#8A2E2B] hover:bg-[#722624] text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-white text-[#1A1817] px-5 py-3.5 rounded-none shadow-xl border border-[#E6DED1] flex items-center gap-3 animate-fadeIn">
          <span className="material-symbols-outlined text-[#2D5A27]">verified</span>
          <p className="text-xs font-medium">{notification}</p>
        </div>
      )}
    </div>
  );
};
