import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Perfume, OlfactoryFamily, GenderStyle, WhenToWearItem } from '../../types/perfume';
import { PerfumeRepository } from '../../repositories/perfumeRepository';
import { GeminiService, GeminiFragranceResult, getFragranticaAccordColor } from '../../services/geminiService';
import { ImageStorageService, SUPABASE_PERFUMES_BUCKET } from '../../services/imageStorageService';
import { WhenToWearCard } from '../common/WhenToWearCard';

export const InventoryManagementView: React.FC = () => {
  const location = useLocation();
  const [perfumes, setPerfumes] = useState(PerfumeRepository.getAll());
  const [search, setSearch] = useState('');

  // Filtros de Auditoría y Verificación de Inventario
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'available' | 'bestsellers' | 'low' | 'out'>('all');
  const [formatFilter, setFormatFilter] = useState<'all' | '100ml' | '50ml'>('all');
  const [familyFilter, setFamilyFilter] = useState<string>('all');
  const [houseFilter, setHouseFilter] = useState<string>('all');
  const [pairingFilter, setPairingFilter] = useState<'all' | 'missing-pair' | 'has-both'>('all');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'stock-asc' | 'stock-desc' | 'price-desc' | 'price-asc' | 'bestsellers-first'>('name-asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPerfumeId, setEditingPerfumeId] = useState<string | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => GeminiService.getApiKey());
  const [notification, setNotification] = useState<string | null>(null);
  const [isEnrichingAll, setIsEnrichingAll] = useState(false);

  // Quick Duplicate (Alternate size 50ml / 100ml) state
  const [duplicateTarget, setDuplicateTarget] = useState<Perfume | null>(null);
  const [duplicateCapacity, setDuplicateCapacity] = useState<'100ml' | '50ml'>('50ml');
  const [duplicateStock, setDuplicateStock] = useState<number>(3);

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
  const [topNotesInput, setTopNotesInput] = useState('');
  const [heartNotesInput, setHeartNotesInput] = useState('');
  const [baseNotesInput, setBaseNotesInput] = useState('');
  const [accords, setAccords] = useState<{ name: string; percentage: number; color?: string }[]>([]);
  const [whenToWear, setWhenToWear] = useState<WhenToWearItem[]>([]);
  const [newAccordName, setNewAccordName] = useState('');
  const [newAccordPct, setNewAccordPct] = useState('80');
  const [isPasteHtmlOpen, setIsPasteHtmlOpen] = useState(false);
  const [htmlInput, setHtmlInput] = useState('');

  const handleParsePastedHtml = () => {
    if (!htmlInput.trim()) return;
    const parsedAccords = GeminiService.parseFragranticaHtmlAccords(htmlInput);
    const parsedWhenToWear = GeminiService.parseFragranticaHtmlWhenToWear(htmlInput);

    const extracted: string[] = [];
    if (parsedAccords.length > 0) {
      setAccords(parsedAccords);
      extracted.push(`${parsedAccords.length} acordes`);
    }
    if (parsedWhenToWear.length > 0) {
      setWhenToWear(parsedWhenToWear);
      extracted.push(`${parsedWhenToWear.length} ocasiones de "Cuándo usarlo"`);
    }

    if (extracted.length > 0) {
      setHtmlInput('');
      setIsPasteHtmlOpen(false);
      showNotify(`✓ Scraping exacto de Fragrantica: ${extracted.join(' y ')}.`);
    } else {
      showNotify('No se detectaron elementos válidos (acordes o cuándo usarlo) en el código HTML.');
    }
  };

  const handleOpenEdit = (perfume: Perfume) => {
    setEditingPerfumeId(perfume.id);
    setNewName(perfume.name);
    setNewHouse(perfume.house);
    setNewFamily(perfume.family);
    const is50 = (perfume.format || '').toLowerCase().includes('50ml');
    setNewCapacity(is50 ? '50ml' : '100ml');
    const concentration = (perfume.format || '').includes('•')
      ? perfume.format.split('•')[1].trim()
      : 'Eau de Parfum';
    setNewConcentration(concentration);
    setNewGender(perfume.gender);
    setNewPrice(perfume.price);
    setNewStock(perfume.stock);
    setNewHasSample(perfume.hasSample ?? true);
    setNewDescription(perfume.description || '');
    setNewImageUrl(perfume.imageUrl || '');
    setImageStorageStatus(null);
    setTopNotes(perfume.notes?.top || []);
    setHeartNotes(perfume.notes?.heart || []);
    setBaseNotes(perfume.notes?.base || []);
    setTopNotesInput((perfume.notes?.top || []).join(', '));
    setHeartNotesInput((perfume.notes?.heart || []).join(', '));
    setBaseNotesInput((perfume.notes?.base || []).join(', '));
    setAccords(perfume.accords || []);
    setWhenToWear(perfume.whenToWear || []);
    setGeminiQuery('');
    setGeminiSearchSuccess(null);
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingPerfumeId(null);
    setNewName('');
    setNewHouse('');
    setNewFamily('Amaderado');
    setNewCapacity('100ml');
    setNewConcentration('Eau de Parfum');
    setNewGender('unisex');
    setNewPrice(15.0);
    setNewStock(3);
    setNewHasSample(true);
    setNewDescription('');
    setNewImageUrl('');
    setImageStorageStatus(null);
    setTopNotes([]);
    setHeartNotes([]);
    setBaseNotes([]);
    setTopNotesInput('');
    setHeartNotesInput('');
    setBaseNotesInput('');
    setAccords([]);
    setWhenToWear([]);
    setGeminiQuery('');
    setGeminiSearchSuccess(null);
    setIsModalOpen(true);
  };

  const handleOpenDuplicate = (perfume: Perfume, forcedCapacity?: '100ml' | '50ml') => {
    const isCurrently50 = (perfume.format || '').toLowerCase().includes('50ml');
    const targetCapacity = forcedCapacity || (isCurrently50 ? '100ml' : '50ml');
    setDuplicateTarget(perfume);
    setDuplicateCapacity(targetCapacity);
    setDuplicateStock(3);
  };

  const handleConfirmDuplicate = () => {
    if (!duplicateTarget) return;

    const targetCapacity = duplicateCapacity;
    const isTarget50 = targetCapacity === '50ml';
    const price = isTarget50 ? 10.0 : 15.0;

    const concentration =
      duplicateTarget.concentration ||
      (duplicateTarget.format?.includes('•')
        ? duplicateTarget.format.split('•')[1].trim()
        : 'Eau de Parfum');

    const formatLabel = `${targetCapacity} • ${concentration}`;

    const newFlacon: Perfume = {
      ...duplicateTarget,
      id: `p-${Date.now()}`,
      format: formatLabel,
      subtitle: `${duplicateTarget.family} • ${formatLabel}`,
      price,
      stock: Math.max(0, duplicateStock),
      concentration,
    };

    PerfumeRepository.saveToSupabase(newFlacon);
    const currentList = PerfumeRepository.getAll();
    const updatedList = [newFlacon, ...currentList];
    PerfumeRepository.save(updatedList);
    setPerfumes(PerfumeRepository.getAll());

    showNotify(`✓ Versión de ${targetCapacity} de "${duplicateTarget.name}" creada exitosamente con ${duplicateStock} unidades.`);
    setDuplicateTarget(null);
  };

  useEffect(() => {
    if (location.state && (location.state as any).editPerfumeId) {
      const targetId = (location.state as any).editPerfumeId;
      const target = perfumes.find((p) => p.id === targetId);
      if (target) {
        handleOpenEdit(target);
      }
    } else if (location.state && (location.state as any).duplicatePerfumeId) {
      const targetId = (location.state as any).duplicatePerfumeId;
      const target = perfumes.find((p) => p.id === targetId);
      const forcedCap = (location.state as any).targetCapacity;
      if (target) {
        handleOpenDuplicate(target, forcedCap);
      }
    }
  }, [location.state, perfumes]);

  const handleAddAccord = () => {
    if (!newAccordName.trim()) return;
    const name = newAccordName.trim().toLowerCase();
    const pct = Math.min(100, Math.max(10, parseInt(newAccordPct) || 80));
    const color = getFragranticaAccordColor(name);
    setAccords((prev) => [...prev, { name, percentage: pct, color }]);
    setNewAccordName('');
    setNewAccordPct('70');
  };

  const handleRemoveAccord = (idxToRemove: number) => {
    setAccords((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

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

  const handleToggleBestseller = (id: string, name: string) => {
    const updated = PerfumeRepository.toggleBestseller(id);
    setPerfumes(PerfumeRepository.getAll());
    const isNow = updated?.isBestseller;
    showNotify(
      isNow
        ? `★ "${name}" marcado como MÁS VENDIDO (Top Seller).`
        : `"${name}" desmarcado de Más Vendidos.`
    );
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

    // Comprobación instantánea si el usuario pegó código HTML de Fragrantica (acordes o cuándo usarlo)
    if (
      query.includes('<') &&
      (query.includes('truncate') ||
        query.includes('tw-rating-card') ||
        query.includes('width:') ||
        query.includes('rgb(') ||
        query.includes('Cuándo usarlo') ||
        query.includes('cuando usarlo') ||
        query.includes('invierno'))
    ) {
      const htmlAccords = GeminiService.parseFragranticaHtmlAccords(query);
      const htmlWhenToWear = GeminiService.parseFragranticaHtmlWhenToWear(query);

      const parts: string[] = [];
      if (htmlAccords.length > 0) {
        setAccords(htmlAccords);
        parts.push(`${htmlAccords.length} acordes principales`);
      }
      if (htmlWhenToWear.length > 0) {
        setWhenToWear(htmlWhenToWear);
        parts.push(`${htmlWhenToWear.length} ocasiones de "Cuándo usarlo"`);
      }

      if (parts.length > 0) {
        setGeminiSearchSuccess(
          `✓ Scraping en tiempo real exitoso: ${parts.join(' y ')} extraídos con sus porcentajes, votos y colores exactos de Fragrantica.`
        );
        showNotify(`✨ ${parts.join(' y ')} extraídos del código HTML.`);
        return;
      }
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
      setTopNotesInput((data.notes.top || []).join(', '));
      setHeartNotesInput((data.notes.heart || []).join(', '));
      setBaseNotesInput((data.notes.base || []).join(', '));
      setAccords(data.accords || []);
      setWhenToWear(data.whenToWear || []);

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

  const handleEnrichAllPerfumes = async () => {
    setIsEnrichingAll(true);
    showNotify('✨ Analizando y clasificando catálogo completo (Familia, Concentración y Acordes)...');
    try {
      const enriched = await PerfumeRepository.enrichAllPerfumes();
      setPerfumes(PerfumeRepository.getAll());
      showNotify(`✓ Se analizaron y actualizaron exitosamente ${enriched.length} fragancias en el catálogo.`);
    } catch {
      showNotify('Error al analizar las fragancias del catálogo.');
    } finally {
      setIsEnrichingAll(false);
    }
  };

  const handleAddPerfume = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newHouse) return;

    const formatLabel = `${newCapacity} • ${newConcentration}`;

    if (editingPerfumeId) {
      const existing = perfumes.find((p) => p.id === editingPerfumeId);
      const updatedFlacon: Perfume = {
        id: editingPerfumeId,
        name: newName,
        house: newHouse,
        subtitle: `${newFamily} • ${formatLabel}`,
        gender: newGender,
        price: newPrice,
        stock: newStock,
        hasSample: newHasSample,
        samplePrice: existing?.samplePrice ?? 10.0,
        format: formatLabel,
        description: newDescription || existing?.description || 'Creación artesanal de vitrina.',
        family: newFamily,
        imageUrl:
          newImageUrl ||
          existing?.imageUrl ||
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBIbXAjfBXcFy-gZ6ZyVZ33BhhVQLnkxF19TxLza72qtz0F-yz9JHJNPU2GYUyA72Ki5ORXLFnMRVOhMSoP9cFr_awMgbeOKU0FWbXpkjohOCdaal_OVCN7qp7uRzIxit5tVG7IEjlyfyMmojWaCUC3DO5871CqKe-MLvaHqDdpsfuf24Jix8bkJxS-eHYJ64MOAcKZzKuVNDBQeOb5reAauHbzUGCsd6io5FbRZbDj',
        imageAlt: newName,
        notes: {
          top: topNotes,
          heart: heartNotes,
          base: baseNotes,
        },
        accords: accords,
        whenToWear: whenToWear.length > 0 ? whenToWear : undefined,
        isBestseller: existing?.isBestseller,
      };

      PerfumeRepository.update(updatedFlacon);
      setPerfumes(PerfumeRepository.getAll());
      setIsModalOpen(false);
      setEditingPerfumeId(null);
      showNotify(`✓ "${newName}" actualizado exitosamente.`);
      return;
    }

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
      whenToWear: whenToWear.length > 0 ? whenToWear : undefined,
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
    setWhenToWear([]);
    setGeminiSearchSuccess(null);

    showNotify(`"${newName}" ingresado al catálogo de vitrina exitosamente.`);
  };

  // Casas y familias únicas para los filtros desplegables
  const houses = useMemo(() => {
    const set = new Set<string>();
    perfumes.forEach((p) => {
      if (p.house) set.add(p.house.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [perfumes]);

  const families = useMemo(() => {
    const set = new Set<string>();
    perfumes.forEach((p) => {
      if (p.family) set.add(p.family.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [perfumes]);

  // Métricas KPI de verificación y auditoría de inventario
  const stats = useMemo(() => {
    const totalFlacons = perfumes.reduce((acc, p) => acc + p.stock, 0);
    const availableCount = perfumes.filter((p) => p.stock > 0).length;
    const bestsellerCount = perfumes.filter((p) => Boolean(p.isBestseller)).length;
    const lowStockCount = perfumes.filter((p) => p.stock > 0 && p.stock <= 2).length;
    const outOfStockCount = perfumes.filter((p) => p.stock === 0).length;
    const missingPairCount = perfumes.filter((item) => {
      return !perfumes.some(
        (p) =>
          p.id !== item.id &&
          p.name.trim().toLowerCase() === item.name.trim().toLowerCase() &&
          p.house.trim().toLowerCase() === item.house.trim().toLowerCase()
      );
    }).length;

    return {
      totalFlacons,
      totalReferences: perfumes.length,
      availableCount,
      bestsellerCount,
      lowStockCount,
      outOfStockCount,
      missingPairCount,
    };
  }, [perfumes]);

  // Filtrado y ordenamiento avanzado de inventario
  const filtered = useMemo(() => {
    const result = perfumes.filter((p) => {
      // 1. Búsqueda por texto (Nombre, Casa o Familia)
      const query = search.trim().toLowerCase();
      if (query) {
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesHouse = p.house.toLowerCase().includes(query);
        const matchesFamily = (p.family || '').toLowerCase().includes(query);
        if (!matchesName && !matchesHouse && !matchesFamily) return false;
      }

      // 2. Estado de Stock / Disponibles / Más Vendidos
      if (stockStatusFilter === 'available' && p.stock <= 0) return false;
      if (stockStatusFilter === 'bestsellers' && !p.isBestseller) return false;
      if (stockStatusFilter === 'low' && (p.stock <= 0 || p.stock > 2)) return false;
      if (stockStatusFilter === 'out' && p.stock > 0) return false;

      // 3. Formato / Capacidad (100ml / 50ml)
      if (formatFilter === '100ml' && !(p.format || '').toLowerCase().includes('100ml')) return false;
      if (formatFilter === '50ml' && !(p.format || '').toLowerCase().includes('50ml')) return false;

      // 4. Maison / Casa
      if (houseFilter !== 'all' && p.house.trim().toLowerCase() !== houseFilter.toLowerCase()) return false;

      // 5. Familia olfativa
      if (familyFilter !== 'all' && (p.family || '').trim().toLowerCase() !== familyFilter.toLowerCase()) return false;

      // 6. Verificación de Dúo (50ml y 100ml)
      if (pairingFilter !== 'all') {
        const hasBoth = perfumes.some(
          (other) =>
            other.id !== p.id &&
            other.name.trim().toLowerCase() === p.name.trim().toLowerCase() &&
            other.house.trim().toLowerCase() === p.house.trim().toLowerCase()
        );
        if (pairingFilter === 'missing-pair' && hasBoth) return false;
        if (pairingFilter === 'has-both' && !hasBoth) return false;
      }

      return true;
    });

    // 7. Ordenamiento
    result.sort((a, b) => {
      if (sortBy === 'bestsellers-first') return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'stock-asc') return a.stock - b.stock;
      if (sortBy === 'stock-desc') return b.stock - a.stock;
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });

    return result;
  }, [
    perfumes,
    search,
    stockStatusFilter,
    formatFilter,
    houseFilter,
    familyFilter,
    pairingFilter,
    sortBy,
  ]);

  const hasActiveFilters =
    search.trim() !== '' ||
    stockStatusFilter !== 'all' ||
    formatFilter !== 'all' ||
    houseFilter !== 'all' ||
    familyFilter !== 'all' ||
    pairingFilter !== 'all' ||
    sortBy !== 'name-asc';

  const handleResetFilters = () => {
    setSearch('');
    setStockStatusFilter('all');
    setFormatFilter('all');
    setHouseFilter('all');
    setFamilyFilter('all');
    setPairingFilter('all');
    setSortBy('name-asc');
  };

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
            type="button"
            onClick={handleEnrichAllPerfumes}
            disabled={isEnrichingAll}
            className={`px-3.5 py-2.5 sm:py-2 rounded-none bg-[#FAF8F5] hover:bg-[#F5F2EB] text-[#775a00] hover:text-[#1A1817] text-xs font-semibold border border-[#c59b27]/60 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
              isEnrichingAll ? 'opacity-70 cursor-wait' : ''
            }`}
            title="Analizar de una vez la familia, concentración (EDP, EDT, etc.), acordes y notas de todas las fragancias creadas"
          >
            <span className={`material-symbols-outlined text-[16px] text-[#c59b27] ${isEnrichingAll ? 'animate-spin' : ''}`}>
              {isEnrichingAll ? 'refresh' : 'auto_fix_high'}
            </span>
            <span>{isEnrichingAll ? 'Analizando Todo...' : '✨ Analizar Catálogo con IA'}</span>
          </button>

          <button
            onClick={() => setIsApiKeyModalOpen(true)}
            className="px-3.5 py-2.5 sm:py-2 rounded-none bg-white hover:bg-[#FAF8F5] text-[#6E665F] hover:text-[#1A1817] text-xs font-semibold border border-[#E6DED1] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            title="Configurar clave de Gemini AI"
          >
            <span className="material-symbols-outlined text-[16px] text-[#c59b27]">smart_toy</span>
            <span>Configurar Gemini</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-none bg-[#c59b27] hover:bg-[#D4AF37] text-[#1A1817] font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>+ Registrar Frasco con Gemini</span>
          </button>
        </div>
      </header>

      {/* 1. KPI Cards de Auditoría y Verificación de Inventario */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {/* Total de Referencias */}
        <button
          type="button"
          onClick={() => {
            setStockStatusFilter('all');
            setPairingFilter('all');
          }}
          className={`p-3 text-left border rounded-none transition-all cursor-pointer ${
            stockStatusFilter === 'all' && pairingFilter === 'all'
              ? 'bg-[#1A1817] text-white border-[#1A1817] shadow-xs'
              : 'bg-white text-[#1A1817] border-[#E6DED1] hover:border-[#1A1817]'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[10px] uppercase font-bold tracking-wider ${stockStatusFilter === 'all' && pairingFilter === 'all' ? 'text-[#c59b27]' : 'text-[#6E665F]'}`}>
              Total Catálogo
            </span>
            <span className="material-symbols-outlined text-[16px]">inventory_2</span>
          </div>
          <div className="font-serif text-2xl font-bold leading-none">{stats.totalReferences}</div>
          <span className={`text-[10px] block mt-1 ${stockStatusFilter === 'all' && pairingFilter === 'all' ? 'text-white/70' : 'text-[#6E665F]'}`}>
            {stats.totalFlacons} frascos en vitrina
          </span>
        </button>

        {/* Stock Disponible (> 0) */}
        <button
          type="button"
          onClick={() => setStockStatusFilter('available')}
          className={`p-3 text-left border rounded-none transition-all cursor-pointer ${
            stockStatusFilter === 'available'
              ? 'bg-[#2D5A27] text-white border-[#2D5A27] shadow-xs'
              : 'bg-white text-[#1A1817] border-[#E6DED1] hover:border-[#2D5A27]'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[10px] uppercase font-bold tracking-wider ${stockStatusFilter === 'available' ? 'text-white/90' : 'text-[#2D5A27]'}`}>
              Disponibles
            </span>
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
          </div>
          <div className="font-serif text-2xl font-bold leading-none">{stats.availableCount}</div>
          <span className={`text-[10px] block mt-1 ${stockStatusFilter === 'available' ? 'text-white/80' : 'text-[#6E665F]'}`}>
            Listos para venta (&gt;0 uds)
          </span>
        </button>

        {/* Más Vendidos (Top Seller) */}
        <button
          type="button"
          onClick={() => setStockStatusFilter('bestsellers')}
          className={`p-3 text-left border rounded-none transition-all cursor-pointer ${
            stockStatusFilter === 'bestsellers'
              ? 'bg-[#c59b27] text-[#1A1817] border-[#c59b27] shadow-xs font-bold'
              : 'bg-[#FDF8EA]/60 text-[#1A1817] border-[#E6DED1] hover:border-[#c59b27]'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[10px] uppercase font-bold tracking-wider ${stockStatusFilter === 'bestsellers' ? 'text-[#1A1817]' : 'text-[#775a00]'}`}>
              ★ Más Vendidos
            </span>
            <span className="material-symbols-outlined text-[16px] text-[#c59b27]">star</span>
          </div>
          <div className="font-serif text-2xl font-bold leading-none">{stats.bestsellerCount}</div>
          <span className={`text-[10px] block mt-1 ${stockStatusFilter === 'bestsellers' ? 'text-[#1A1817]/80' : 'text-[#775a00]'}`}>
            Fragancias insignia
          </span>
        </button>

        {/* Stock Bajo (1-2 uds) */}
        <button
          type="button"
          onClick={() => setStockStatusFilter('low')}
          className={`p-3 text-left border rounded-none transition-all cursor-pointer ${
            stockStatusFilter === 'low'
              ? 'bg-[#B8860B] text-white border-[#B8860B] shadow-xs'
              : 'bg-[#FDF8EA]/60 text-[#1A1817] border-[#E6DED1] hover:border-[#B8860B]'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[10px] uppercase font-bold tracking-wider ${stockStatusFilter === 'low' ? 'text-white/90' : 'text-[#946E19]'}`}>
              Stock Bajo
            </span>
            <span className="material-symbols-outlined text-[16px]">warning</span>
          </div>
          <div className="font-serif text-2xl font-bold leading-none">{stats.lowStockCount}</div>
          <span className={`text-[10px] block mt-1 ${stockStatusFilter === 'low' ? 'text-white/80' : 'text-[#946E19]'}`}>
            Quedan 1 o 2 unidades
          </span>
        </button>

        {/* Agotados (0 uds) */}
        <button
          type="button"
          onClick={() => setStockStatusFilter('out')}
          className={`p-3 text-left border rounded-none transition-all cursor-pointer ${
            stockStatusFilter === 'out'
              ? 'bg-[#8A2E2B] text-white border-[#8A2E2B] shadow-xs'
              : 'bg-[#FAF0EF]/60 text-[#1A1817] border-[#E6DED1] hover:border-[#8A2E2B]'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[10px] uppercase font-bold tracking-wider ${stockStatusFilter === 'out' ? 'text-white/90' : 'text-[#8A2E2B]'}`}>
              Agotados
            </span>
            <span className="material-symbols-outlined text-[16px]">error</span>
          </div>
          <div className="font-serif text-2xl font-bold leading-none">{stats.outOfStockCount}</div>
          <span className={`text-[10px] block mt-1 ${stockStatusFilter === 'out' ? 'text-white/80' : 'text-[#8A2E2B]'}`}>
            0 unidades en existencia
          </span>
        </button>

        {/* Pendientes de Crear Versión Alterna */}
        <button
          type="button"
          onClick={() => setPairingFilter('missing-pair')}
          className={`p-3 text-left border rounded-none transition-all cursor-pointer ${
            pairingFilter === 'missing-pair'
              ? 'bg-[#775a00] text-white border-[#775a00] shadow-xs'
              : 'bg-white text-[#1A1817] border-[#E6DED1] hover:border-[#775a00]'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[10px] uppercase font-bold tracking-wider ${pairingFilter === 'missing-pair' ? 'text-white/90' : 'text-[#775a00]'}`}>
              Falta 2º Tamaño
            </span>
            <span className="material-symbols-outlined text-[16px]">content_copy</span>
          </div>
          <div className="font-serif text-2xl font-bold leading-none">{stats.missingPairCount}</div>
          <span className={`text-[10px] block mt-1 ${pairingFilter === 'missing-pair' ? 'text-white/80' : 'text-[#6E665F]'}`}>
            Falta 50ml o 100ml
          </span>
        </button>
      </div>

      {/* Search and Table */}
      <div className="bg-white rounded-none shadow-xs border border-[#E6DED1] overflow-hidden mb-8">
        {/* Barra Avanzada de Filtros de Verificación */}
        <div className="p-4 bg-[#FAF8F5] border-b border-[#E6DED1] space-y-3">
          {/* Fila 1: Buscador en tiempo real + Botones de Estado de Stock + Formato */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Buscador */}
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#6E665F]">
                search
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por fragancia, casa o familia..."
                className="w-full bg-white pl-9 pr-8 py-2 rounded-none border border-[#E6DED1] text-xs outline-none focus:border-[#c59b27] transition-all placeholder:text-[#6E665F]"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6E665F] hover:text-[#1A1817] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              )}
            </div>

            {/* Píldoras Rápidas de Existencias */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E665F] mr-1 shrink-0">
                Filtros:
              </span>
              {[
                { id: 'all', label: 'Todos' },
                { id: 'available', label: '✓ Disponibles (>0)' },
                { id: 'bestsellers', label: '★ Más Vendidos' },
                { id: 'low', label: 'Bajo (1-2)' },
                { id: 'out', label: 'Agotado (0)' },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStockStatusFilter(st.id as any)}
                  className={`px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap border transition-all cursor-pointer ${
                    stockStatusFilter === st.id
                      ? st.id === 'bestsellers'
                        ? 'bg-[#c59b27] text-[#1A1817] border-[#c59b27] font-bold shadow-xs'
                        : 'bg-[#1A1817] text-white border-[#1A1817]'
                      : 'bg-white text-[#2C2826] border-[#E6DED1] hover:bg-[#F5F2EB]'
                  }`}
                >
                  {st.label}
                </button>
              ))}

              <span className="h-4 w-[1px] bg-[#E6DED1] mx-1"></span>

              {/* Filtro de Formato */}
              {[
                { id: 'all', label: 'Todos ml' },
                { id: '100ml', label: '100ml ($15)' },
                { id: '50ml', label: '50ml ($10)' },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setFormatFilter(fmt.id as any)}
                  className={`px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap border transition-all cursor-pointer ${
                    formatFilter === fmt.id
                      ? 'bg-[#775a00] text-white border-[#775a00]'
                      : 'bg-white text-[#2C2826] border-[#E6DED1] hover:bg-[#F5F2EB]'
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fila 2: Selectores Específicos (Maison, Familia, Par 50/100, Ordenamiento) */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[#E6DED1]/60 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              {/* Selector Maison / Casa */}
              <div className="flex items-center gap-1 bg-white border border-[#E6DED1] px-2 py-1">
                <span className="text-[10px] text-[#6E665F] font-bold uppercase">Maison:</span>
                <select
                  value={houseFilter}
                  onChange={(e) => setHouseFilter(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-[#1A1817] outline-none cursor-pointer"
                >
                  <option value="all">Todas ({houses.length})</option>
                  {houses.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector Familia Olfativa */}
              <div className="flex items-center gap-1 bg-white border border-[#E6DED1] px-2 py-1">
                <span className="text-[10px] text-[#6E665F] font-bold uppercase">Familia:</span>
                <select
                  value={familyFilter}
                  onChange={(e) => setFamilyFilter(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-[#1A1817] outline-none cursor-pointer"
                >
                  <option value="all">Todas ({families.length})</option>
                  {families.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector Verificación de Dúo (50ml y 100ml) */}
              <div className="flex items-center gap-1 bg-white border border-[#E6DED1] px-2 py-1">
                <span className="text-[10px] text-[#6E665F] font-bold uppercase">Formatos:</span>
                <select
                  value={pairingFilter}
                  onChange={(e) => setPairingFilter(e.target.value as any)}
                  className="bg-transparent text-xs font-semibold text-[#1A1817] outline-none cursor-pointer"
                >
                  <option value="all">Todos los Registros</option>
                  <option value="missing-pair">Falta Crear 2º Tamaño (50/100ml)</option>
                  <option value="has-both">Ambos Tamaños Listos (100ml &amp; 50ml)</option>
                </select>
              </div>

              {/* Selector Ordenar por */}
              <div className="flex items-center gap-1 bg-white border border-[#E6DED1] px-2 py-1">
                <span className="text-[10px] text-[#6E665F] font-bold uppercase">Ordenar:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-xs font-semibold text-[#1A1817] outline-none cursor-pointer"
                >
                  <option value="name-asc">Nombre (A - Z)</option>
                  <option value="name-desc">Nombre (Z - A)</option>
                  <option value="bestsellers-first">★ Más Vendidos Primero</option>
                  <option value="stock-asc">Stock: Menor a Mayor (Faltantes)</option>
                  <option value="stock-desc">Stock: Mayor a Menor</option>
                  <option value="price-desc">Precio: Mayor a Menor</option>
                  <option value="price-asc">Precio: Menor a Mayor</option>
                </select>
              </div>
            </div>

            {/* Contador & Botón Limpiar */}
            <div className="flex items-center gap-2 ml-auto">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-[#8A2E2B] hover:text-[#5a1e1c] font-bold flex items-center gap-1 cursor-pointer transition-colors px-2 py-1 bg-white border border-[#8A2E2B]/30 hover:border-[#8A2E2B]"
                >
                  <span className="material-symbols-outlined text-[14px]">filter_alt_off</span>
                  <span>Limpiar Filtros</span>
                </button>
              )}
              <span className="font-mono text-xs text-[#6E665F] whitespace-nowrap bg-white px-2 py-1 border border-[#E6DED1]">
                <strong>{filtered.length}</strong> de {perfumes.length} fragancias
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[980px] border-collapse">
            <thead>
              <tr className="bg-[#F5F2EB] text-[#6E665F] font-label-md uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Fragancia</th>
                <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Maison</th>
                <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Formato</th>
                <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Familia</th>
                <th className="py-3.5 px-4 text-right font-semibold whitespace-nowrap">Precio USD</th>
                <th className="py-3.5 px-4 text-center font-semibold whitespace-nowrap">Tester / Muestra</th>
                <th className="py-3.5 px-4 text-center font-semibold whitespace-nowrap">Stock Vitrina</th>
                <th className="py-3.5 px-4 text-center font-semibold whitespace-nowrap">Acciones</th>
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
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span>{item.name}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleBestseller(item.id, item.name);
                              }}
                              className={`p-0.5 rounded cursor-pointer transition-all ${
                                item.isBestseller
                                  ? 'text-[#c59b27] hover:scale-110'
                                  : 'text-[#C5BEB3] hover:text-[#c59b27]'
                              }`}
                              title={item.isBestseller ? 'Quitar de Más Vendidos' : 'Marcar como Más Vendido (Top Seller)'}
                            >
                              <span className="material-symbols-outlined text-[16px] leading-none">
                                {item.isBestseller ? 'star' : 'star_border'}
                              </span>
                            </button>
                            {item.isBestseller && (
                              <span className="px-1.5 py-0.5 bg-[#FDF8EA] border border-[#c59b27]/40 text-[#775a00] text-[9px] font-bold uppercase tracking-wider">
                                Top Venta
                              </span>
                            )}
                          </div>
                          {item.notes?.top &&
                            item.notes.top.length > 0 &&
                            !(
                              item.notes.top.includes('Bergamota de Calabria') &&
                              item.notes.top.includes('Cardamomo')
                            ) && (
                              <span className="block text-[10px] text-[#6E665F] truncate max-w-xs font-normal">
                                Salida: {item.notes.top.join(', ')}
                              </span>
                            )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#6E665F] font-medium whitespace-nowrap">{item.house}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono text-xs font-semibold">{item.format}</span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-none bg-[#F5F2EB] text-[#775a00] font-semibold text-[10px] border border-[#E6DED1]">
                        {item.family}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-[#1A1817] whitespace-nowrap">
                      ${item.price.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
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
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        {item.stock === 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FAF0EF] text-[#8A2E2B] text-[10px] font-bold border border-[#8A2E2B]/30 tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#8A2E2B] animate-pulse"></span>
                            <span>AGOTADO</span>
                          </span>
                        ) : item.stock <= 2 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FDF8EA] text-[#946E19] text-[10px] font-bold border border-[#c59b27]/40 tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#c59b27]"></span>
                            <span>BAJO</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F0F5EE] text-[#2D5A27] text-[10px] font-semibold border border-[#2D5A27]/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A27]"></span>
                            <span>OK</span>
                          </span>
                        )}

                        <div className="inline-flex items-center gap-1 bg-[#F5F2EB] p-1 rounded-none border border-[#E6DED1]">
                          <button
                            type="button"
                            onClick={() => handleStockDelta(item.id, -1)}
                            className="w-5 h-5 rounded-none bg-white hover:bg-[#ECE7DE] text-[#1A1817] font-bold flex items-center justify-center cursor-pointer shadow-xs"
                            title="Restar 1 unidad"
                          >
                            -
                          </button>
                          <span className="font-mono font-bold text-xs w-6 text-center">{item.stock}</span>
                          <button
                            type="button"
                            onClick={() => handleStockDelta(item.id, 1)}
                            className="w-5 h-5 rounded-none bg-white hover:bg-[#ECE7DE] text-[#1A1817] font-bold flex items-center justify-center cursor-pointer shadow-xs"
                            title="Sumar 1 unidad"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Duplicate to alternate size (50ml / 100ml) - deshabilitado si ya existen ambas */}
                        {(() => {
                          const is50 = (item.format || '').toLowerCase().includes('50ml');
                          const alternateCap = is50 ? '100ml' : '50ml';
                          const alternatePrice = is50 ? 15 : 10;
                          const hasBothOptions = perfumes.some(
                            (p) =>
                              p.id !== item.id &&
                              p.name.trim().toLowerCase() === item.name.trim().toLowerCase() &&
                              p.house.trim().toLowerCase() === item.house.trim().toLowerCase()
                          );

                          return (
                            <button
                              type="button"
                              disabled={hasBothOptions}
                              onClick={() => !hasBothOptions && handleOpenDuplicate(item)}
                              className={`h-7 px-2 rounded-none border font-mono text-[11px] font-semibold whitespace-nowrap inline-flex items-center gap-1 transition-colors ${
                                hasBothOptions
                                  ? 'bg-[#F5F2EB]/60 text-[#6E665F]/50 border-[#E6DED1]/60 cursor-not-allowed select-none'
                                  : 'bg-white hover:bg-[#FAF8F5] text-[#1A1817] hover:text-[#775a00] border-[#E6DED1] hover:border-[#c59b27] cursor-pointer shadow-2xs active:scale-95'
                              }`}
                              title={
                                hasBothOptions
                                  ? 'Ambas opciones (50ml y 100ml) ya están registradas en el catálogo'
                                  : `Crear versión de ${alternateCap} ($${alternatePrice} USD) copiando acordes, notas e imagen`
                              }
                            >
                              <span
                                className={`font-bold text-xs leading-none ${
                                  hasBothOptions ? 'text-[#6E665F]/40' : 'text-[#c59b27]'
                                }`}
                              >
                                +
                              </span>
                              <span>{alternateCap}</span>
                            </button>
                          );
                        })()}

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="w-7 h-7 rounded-none bg-white hover:bg-[#F5F2EB] text-[#775a00] border border-[#E6DED1] hover:border-[#c59b27] inline-flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                          title={`Editar "${item.name}"`}
                        >
                          <span className="material-symbols-outlined text-[15px]">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPerfumeToDelete(item)}
                          className="w-7 h-7 rounded-none bg-white hover:bg-[#FAF0EF] text-[#8A2E2B] border border-[#E6DED1] hover:border-[#8A2E2B]/40 inline-flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                          title={`Eliminar "${item.name}"`}
                        >
                          <span className="material-symbols-outlined text-[15px]">delete</span>
                        </button>
                      </div>
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
                <span className="material-symbols-outlined text-[#c59b27] text-2xl">
                  {editingPerfumeId ? 'edit_note' : 'auto_awesome'}
                </span>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#c59b27] tracking-widest block">
                    {editingPerfumeId ? 'Edición de Catálogo' : 'Catalogación Asistida por IA'}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-[#1A1817]">
                    {editingPerfumeId ? `Editar Fragancia: ${newName || 'Frasco'}` : 'Registrar Nuevo Frasco con Gemini AI'}
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
                      placeholder="Pega un enlace de Fragrantica (URL), el código HTML de acordes, o el nombre del perfume..."
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
                    <select
                      value={newConcentration}
                      onChange={(e) => setNewConcentration(e.target.value)}
                      className="w-full p-2.5 bg-white border border-[#E6DED1] rounded-none outline-none focus:border-[#c59b27] text-[#1A1817] font-medium cursor-pointer"
                    >
                      <option value="Eau de Parfum">Eau de Parfum (EDP)</option>
                      <option value="Extrait de Parfum">Extrait de Parfum</option>
                      <option value="Eau de Toilette">Eau de Toilette (EDT)</option>
                      <option value="Elixir">Elixir</option>
                      <option value="Parfum">Parfum</option>
                      <option value="Eau de Cologne">Eau de Cologne (EDC)</option>
                    </select>
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

                {/* Olfactory Pyramid (Notas Verídicas Editables) */}
                <div className="p-3.5 bg-[#FAF8F5] border border-[#E6DED1] space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[11px] uppercase tracking-wider text-[#1A1817] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px] text-[#c59b27]">filter_vintage</span>
                      Pirámide Olfativa (Notas Verídicas)
                    </span>
                    <span className="text-[10px] text-[#6E665F]">Separadas por comas</span>
                  </div>

                  <div className="space-y-3 text-[11px]">
                    <div>
                      <label className="font-bold text-[#6E665F] uppercase text-[9px] block mb-1">
                        Notas de Salida (Top Notes):
                      </label>
                      <input
                        type="text"
                        value={topNotesInput}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTopNotesInput(val);
                          setTopNotes(val.split(',').map((s) => s.trim()).filter(Boolean));
                        }}
                        placeholder="Ej: Clementina, Nectarina, Grosellas negras"
                        className="w-full text-xs p-2 bg-white border border-[#E6DED1] focus:border-[#775a00] outline-none"
                      />
                      {topNotes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {topNotes.map((note, i) => (
                            <span key={i} className="px-2 py-0.5 bg-white border border-[#E6DED1] text-[#1A1817] text-[10px]">
                              {note}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="font-bold text-[#6E665F] uppercase text-[9px] block mb-1">
                        Notas de Corazón (Heart Notes):
                      </label>
                      <input
                        type="text"
                        value={heartNotesInput}
                        onChange={(e) => {
                          const val = e.target.value;
                          setHeartNotesInput(val);
                          setHeartNotes(val.split(',').map((s) => s.trim()).filter(Boolean));
                        }}
                        placeholder="Ej: Orquídea silvestre, Flor de azahar, Jazmín"
                        className="w-full text-xs p-2 bg-white border border-[#E6DED1] focus:border-[#775a00] outline-none"
                      />
                      {heartNotes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {heartNotes.map((note, i) => (
                            <span key={i} className="px-2 py-0.5 bg-[#F5F2EB] border border-[#E6DED1] text-[#775a00] font-medium text-[10px]">
                              {note}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="font-bold text-[#6E665F] uppercase text-[9px] block mb-1">
                        Notas de Fondo (Base Notes):
                      </label>
                      <input
                        type="text"
                        value={baseNotesInput}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBaseNotesInput(val);
                          setBaseNotes(val.split(',').map((s) => s.trim()).filter(Boolean));
                        }}
                        placeholder="Ej: Ámbar, Almizcle, Maderas preciosas"
                        className="w-full text-xs p-2 bg-white border border-[#E6DED1] focus:border-[#775a00] outline-none"
                      />
                      {baseNotes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {baseNotes.map((note, i) => (
                            <span key={i} className="px-2 py-0.5 bg-white border border-[#E6DED1] text-[#1A1817] text-[10px]">
                              {note}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Acordes Principales de Fragrantica */}
                <div className="p-3.5 bg-[#FAF8F5] border border-[#E6DED1] space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[11px] uppercase tracking-wider text-[#1A1817] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px] text-[#c59b27]">bar_chart</span>
                      Acordes Principales (Fragrantica)
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#6E665F]">
                        {accords.length} {accords.length === 1 ? 'acorde detectado' : 'acordes detectados'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsPasteHtmlOpen(!isPasteHtmlOpen)}
                        className="text-[10px] text-[#775a00] hover:text-[#B8860B] font-bold flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 border border-[#E6DED1]"
                        title="Pegar código HTML copiado de Fragrantica"
                      >
                        <span className="material-symbols-outlined text-[13px]">code</span>
                        <span>{isPasteHtmlOpen ? 'Cerrar HTML' : 'Pegar HTML'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Área desplegable para pegar código HTML de Fragrantica */}
                  {isPasteHtmlOpen && (
                    <div className="p-3 bg-white border border-[#E6DED1] space-y-2 animate-fadeIn">
                      <label className="text-[10px] text-[#1A1817] font-bold uppercase tracking-wider block">
                        Pega el código HTML copiado de Fragrantica (DevTools):
                      </label>
                      <textarea
                        rows={3}
                        value={htmlInput}
                        onChange={(e) => setHtmlInput(e.target.value)}
                        placeholder='Pega aquí el código HTML copiado de Fragrantica (Acordes principales o widget "Cuándo usarlo")...'
                        className="w-full p-2 bg-[#FAF8F5] border border-[#E6DED1] text-[11px] font-mono text-[#1A1817] outline-none focus:border-[#c59b27]"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsPasteHtmlOpen(false)}
                          className="px-2.5 py-1 text-xs text-[#6E665F] hover:text-[#1A1817] cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleParsePastedHtml}
                          className="px-3 py-1 bg-[#c59b27] hover:bg-[#D4AF37] text-[#1A1817] text-xs font-bold cursor-pointer shadow-xs"
                        >
                          Extraer Datos (Acordes &amp; Ocasiones)
                        </button>
                      </div>
                    </div>
                  )}

                  {accords.length > 0 ? (
                    <div className="space-y-1.5 pt-1">
                      {accords.map((accord, idx) => {
                        const color = accord.color || getFragranticaAccordColor(accord.name);
                        const isLightColor =
                          color === '#FDD835' ||
                          color === '#FBC02D' ||
                          color === '#C7A75C' ||
                          color === '#80CBC4' ||
                          color === '#80DEEA' ||
                          color === '#81D4FA' ||
                          color === '#B39DDB' ||
                          color === '#D4C5A9' ||
                          color === '#D7CCC8';
                        const textColor = isLightColor ? '#1A1817' : '#FFFFFF';

                        return (
                          <div key={idx} className="flex items-center gap-2 group">
                            <div
                              className="h-6.5 flex items-center justify-between px-3 shadow-2xs rounded-r-sm transition-all"
                              style={{
                                width: `${Math.max(38, Math.min(100, accord.percentage))}%`,
                                backgroundColor: color,
                              }}
                            >
                              <span
                                className="text-[11px] font-bold tracking-wide whitespace-nowrap capitalize"
                                style={{ color: textColor }}
                              >
                                {accord.name}
                              </span>
                              <span
                                className="font-mono text-[10px] font-bold opacity-90 pl-1.5"
                                style={{ color: textColor }}
                              >
                                {accord.percentage}%
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveAccord(idx)}
                              className="text-[#6E665F] hover:text-[#8A2E2B] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-0.5"
                              title={`Eliminar acorde ${accord.name}`}
                            >
                              <span className="material-symbols-outlined text-[14px]">close</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[11px] text-[#6E665F] italic">
                      No hay acordes registrados aún. Al investigar con Gemini o ingresar un enlace de Fragrantica, se cargarán automáticamente con sus colores oficiales.
                    </p>
                  )}

                  {/* Añadir Acorde Manualmente */}
                  <div className="pt-2 border-t border-[#E6DED1] flex gap-2 items-center">
                    <input
                      type="text"
                      value={newAccordName}
                      onChange={(e) => setNewAccordName(e.target.value)}
                      placeholder="Añadir acorde (ej. amaderado, dulce, aromático)..."
                      className="flex-1 px-2.5 py-1 bg-white border border-[#E6DED1] rounded-none text-xs text-[#1A1817] outline-none focus:border-[#c59b27]"
                    />
                    <div className="flex items-center gap-1 w-24">
                      <input
                        type="number"
                        min="10"
                        max="100"
                        value={newAccordPct}
                        onChange={(e) => setNewAccordPct(e.target.value)}
                        className="w-14 px-1.5 py-1 bg-white border border-[#E6DED1] rounded-none text-xs text-[#1A1817] font-mono font-bold text-center outline-none focus:border-[#c59b27]"
                      />
                      <span className="text-[11px] text-[#6E665F] font-mono">%</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddAccord}
                      className="px-2.5 py-1 bg-[#F5F2EB] hover:bg-[#E6DED1] text-[#1A1817] text-xs font-bold border border-[#E6DED1] cursor-pointer"
                    >
                      + Añadir
                    </button>
                  </div>

                  {/* Votación "CUÁNDO USARLO" de Fragrantica (Preview) */}
                  {whenToWear.length > 0 && (
                    <div className="pt-2">
                      <WhenToWearCard items={whenToWear} variant="dark" />
                    </div>
                  )}
                </div>

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
                {editingPerfumeId ? `Guardar Cambios (${newName || 'Fragancia'})` : `Guardar en Vitrina ($${newPrice.toFixed(2)})`}
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

      {/* Modal Duplicar Versión (100ml / 50ml) */}
      {duplicateTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1817]/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-none shadow-2xl border border-[#E6DED1] overflow-hidden">
            {/* Header */}
            <div className="p-5 bg-[#F5F2EB] border-b border-[#E6DED1] flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#c59b27] text-2xl">
                  difference
                </span>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#c59b27] tracking-widest block">
                    Duplicar Creación • Nuevo Formato
                  </span>
                  <h3 className="font-serif text-lg font-bold text-[#1A1817]">
                    Crear Versión de {duplicateCapacity}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDuplicateTarget(null)}
                className="w-8 h-8 rounded-none bg-white hover:bg-neutral-200 text-[#2C2826] flex items-center justify-center transition-colors cursor-pointer border border-[#E6DED1]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5 text-xs">
              {/* Product Card Summary */}
              <div className="p-3.5 bg-[#FAF8F5] border border-[#E6DED1] flex items-center gap-3">
                <div className="w-14 h-14 bg-white border border-[#E6DED1] overflow-hidden shrink-0 flex items-center justify-center p-1 shadow-2xs">
                  <img
                    src={duplicateTarget.imageUrl}
                    alt={duplicateTarget.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-sm text-[#1A1817] truncate">{duplicateTarget.name}</span>
                    <span className="text-xs text-[#775a00] font-medium">{duplicateTarget.house}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-[#6E665F]">
                    <span>Familia {duplicateTarget.family}</span>
                    <span>•</span>
                    <span>{duplicateTarget.format} (Actual)</span>
                  </div>
                </div>
              </div>

              {/* Informative Note */}
              <div className="p-3 bg-[#F0F5EE] border border-[#2D5A27]/25 text-[#2D5A27] text-[11px] flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">verified</span>
                <span>
                  Se clonarán automáticamente todos los <strong>acordes</strong>, <strong>notas olfativas</strong>, <strong>fotografía</strong>, <strong>descripción</strong> y <strong>familia</strong>. Solo define el tamaño y las existencias.
                </span>
              </div>

              {/* Selector Formato / Capacidad */}
              <div>
                <label className="block text-[#1A1817] font-bold uppercase tracking-wider text-[11px] mb-2">
                  Selecciona el Formato de la Nueva Versión
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDuplicateCapacity('100ml')}
                    className={`p-3 border text-left transition-all cursor-pointer ${
                      duplicateCapacity === '100ml'
                        ? 'border-[#c59b27] bg-[#FAF8F5] shadow-xs'
                        : 'border-[#E6DED1] bg-white opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-[#1A1817]">100ml</span>
                      <span className="font-mono font-bold text-xs text-[#2D5A27]">$15.00 USD</span>
                    </div>
                    <span className="text-[10px] text-[#6E665F] block mt-0.5">Frasco Grande Vitrina</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDuplicateCapacity('50ml')}
                    className={`p-3 border text-left transition-all cursor-pointer ${
                      duplicateCapacity === '50ml'
                        ? 'border-[#c59b27] bg-[#FAF8F5] shadow-xs'
                        : 'border-[#E6DED1] bg-white opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-[#1A1817]">50ml</span>
                      <span className="font-mono font-bold text-xs text-[#2D5A27]">$10.00 USD</span>
                    </div>
                    <span className="text-[10px] text-[#6E665F] block mt-0.5">Frasco Mediano Atelier</span>
                  </button>
                </div>
              </div>

              {/* Cantidad / Stock Input */}
              <div>
                <label className="block text-[#1A1817] font-bold uppercase tracking-wider text-[11px] mb-1.5">
                  Cantidad Inicial en Stock
                </label>
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center border border-[#E6DED1] bg-white">
                    <button
                      type="button"
                      onClick={() => setDuplicateStock((s) => Math.max(0, s - 1))}
                      className="w-9 h-9 flex items-center justify-center bg-[#F5F2EB] hover:bg-[#ECE7DE] text-[#1A1817] font-bold text-base cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={0}
                      value={duplicateStock}
                      onChange={(e) => setDuplicateStock(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-16 h-9 text-center font-mono font-bold text-sm text-[#1A1817] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setDuplicateStock((s) => s + 1)}
                      className="w-9 h-9 flex items-center justify-center bg-[#F5F2EB] hover:bg-[#ECE7DE] text-[#1A1817] font-bold text-base cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-[11px] text-[#6E665F]">
                    Unidades físicas listas para el inventario de esta versión.
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-[#F5F2EB] border-t border-[#E6DED1] flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDuplicateTarget(null)}
                className="px-4 py-2 border border-[#E6DED1] bg-white hover:bg-[#FAF8F5] text-[#2C2826] font-semibold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDuplicate}
                className="px-5 py-2 bg-[#c59b27] hover:bg-[#D4AF37] text-[#1A1817] font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                <span>Crear Versión de {duplicateCapacity}</span>
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
