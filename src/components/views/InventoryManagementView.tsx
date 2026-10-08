import React, { useState } from 'react';
import { Perfume, OlfactoryFamily } from '../../types/perfume';
import { PerfumeRepository } from '../../repositories/perfumeRepository';

export const InventoryManagementView: React.FC = () => {
  const [perfumes, setPerfumes] = useState(PerfumeRepository.getAll());
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // New perfume form state
  const [newName, setNewName] = useState('');
  const [newHouse, setNewHouse] = useState('');
  const [newFamily, setNewFamily] = useState<OlfactoryFamily>('Floral');
  const [newPrice, setNewPrice] = useState(45);
  const [newStock, setNewStock] = useState(2);
  const [newFormat, setNewFormat] = useState('100ml • EDP');

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleStockDelta = (id: string, delta: number) => {
    PerfumeRepository.updateStock(id, delta);
    setPerfumes(PerfumeRepository.getAll());
  };

  const handleAddPerfume = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newHouse) return;

    const newFlacon: Perfume = {
      id: `p-${Date.now()}`,
      name: newName,
      house: newHouse,
      subtitle: `${newFormat} • Lote Verificado`,
      gender: 'fem',
      price: newPrice,
      stock: newStock,
      hasSample: true,
      format: newFormat,
      description: 'Creación artesanal ingresada a la vitrina de Place Vendôme.',
      family: newFamily,
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBIbXAjfBXcFy-gZ6ZyVZ33BhhVQLnkxF19TxLza72qtz0F-yz9JHJNPU2GYUyA72Ki5ORXLFnMRVOhMSoP9cFr_awMgbeOKU0FWbXpkjohOCdaal_OVCN7qp7uRzIxit5tVG7IEjlyfyMmojWaCUC3DO5871CqKe-MLvaHqDdpsfuf24Jix8bkJxS-eHYJ64MOAcKZzKuVNDBQeOb5reAauHbzUGCsd6io5FbRZbDj',
      imageAlt: newName,
    };

    const updated = [newFlacon, ...perfumes];
    PerfumeRepository.save(updated);
    setPerfumes(updated);
    setIsModalOpen(false);
    setNewName('');
    setNewHouse('');
    showNotify(`"${newName}" ingresado a la bóveda exitosamente.`);
  };

  const filtered = perfumes.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.house.toLowerCase().includes(search.toLowerCase()) ||
      p.family.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full">
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-6 border-b border-[#E6DED1]/80 mb-6">
        <div>
          <div className="flex items-center gap-2 text-[#6E665F] font-label-sm uppercase tracking-widest text-xs font-bold">
            <span>Bóveda Central</span>
            <span className="text-[#c59b27]">•</span>
            <span>Inventario &amp; Catálogo Maestro</span>
          </div>
          <h1 className="font-headline-lg text-[#1A1817] tracking-tight font-serif text-3xl font-semibold mt-1">
            Inventario &amp; Libro de Flacons
          </h1>
          <p className="font-body-md text-[#6E665F] text-sm mt-1">
            Registro de frascos sellados, niveles de stock en vitrina y control de testers para decantación.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-lg bg-[#c59b27] hover:bg-[#D4AF37] text-[#1A1817] font-semibold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>+ Registrar Nuevo Frasco</span>
          </button>
        </div>
      </header>

      {/* Search and Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E6DED1] overflow-hidden mb-8">
        <div className="p-4 bg-[#F5F2EB]/50 border-b border-[#E6DED1] flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#6E665F]">
              search
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrar por nombre o casa..."
              className="w-full bg-white pl-9 pr-3 py-1.5 rounded-lg border border-[#E6DED1] text-xs outline-none focus:border-[#c59b27]"
            />
          </div>
          <div className="text-xs text-[#6E665F]">
            Total en Bóveda: <strong>{perfumes.reduce((acc, p) => acc + p.stock, 0)} unidades</strong>
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
                <th className="py-3 px-4 text-center font-semibold">Muestra</th>
                <th className="py-3 px-4 text-center font-semibold">Stock en Vitrina</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F2EB] text-[#2C2826]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#F5F2EB]/30 transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#1A1817]">{item.name}</td>
                  <td className="py-3 px-4 text-[#6E665F]">{item.house}</td>
                  <td className="py-3 px-4">{item.format}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-[#F5F2EB] text-[#775a00] font-semibold text-[10px] border border-[#E6DED1]">
                      {item.family}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold">${item.price.toFixed(2)}</td>
                  <td className="py-3 px-4 text-center">
                    {item.hasSample ? (
                      <span className="px-2 py-0.5 rounded bg-[#F0F5EE] text-[#2D5A27] font-bold text-[10px] border border-[#2D5A27]/20">
                        Muestra: SÍ
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-[#FAF0EF] text-[#8A2E2B] font-bold text-[10px] border border-[#8A2E2B]/20">
                        Muestra: NO
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="inline-flex items-center gap-2 bg-[#F5F2EB] p-1 rounded-lg border border-[#E6DED1]">
                      <button
                        onClick={() => handleStockDelta(item.id, -1)}
                        className="w-5 h-5 rounded bg-white hover:bg-[#ECE7DE] text-[#1A1817] font-bold flex items-center justify-center cursor-pointer shadow-xs"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold text-xs w-6 text-center">{item.stock}</span>
                      <button
                        onClick={() => handleStockDelta(item.id, 1)}
                        className="w-5 h-5 rounded bg-white hover:bg-[#ECE7DE] text-[#1A1817] font-bold flex items-center justify-center cursor-pointer shadow-xs"
                      >
                        +
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Flacon */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1817]/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 border border-[#E6DED1]">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#E6DED1]">
              <h3 className="font-serif text-lg font-bold text-[#1A1817]">Registrar Nuevo Flacon</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F5F2EB] text-[#2C2826] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <form onSubmit={handleAddPerfume} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#6E665F] mb-1">Nombre de la Fragancia</label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  placeholder="Ej. Baccarat Rouge 540"
                  className="w-full p-2 rounded bg-[#F5F2EB] border border-[#E6DED1] outline-none text-[#1A1817]"
                />
              </div>
              <div>
                <label className="block text-[#6E665F] mb-1">Casa / Maison</label>
                <input
                  value={newHouse}
                  onChange={(e) => setNewHouse(e.target.value)}
                  required
                  placeholder="Ej. Maison Francis Kurkdjian"
                  className="w-full p-2 rounded bg-[#F5F2EB] border border-[#E6DED1] outline-none text-[#1A1817]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#6E665F] mb-1">Precio USD</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full p-2 rounded bg-[#F5F2EB] border border-[#E6DED1] outline-none text-[#1A1817]"
                  />
                </div>
                <div>
                  <label className="block text-[#6E665F] mb-1">Stock Inicial</label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full p-2 rounded bg-[#F5F2EB] border border-[#E6DED1] outline-none text-[#1A1817]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#6E665F] mb-1">Familia Olfativa</label>
                <select
                  value={newFamily}
                  onChange={(e) => setNewFamily(e.target.value as OlfactoryFamily)}
                  className="w-full p-2 rounded bg-[#F5F2EB] border border-[#E6DED1] outline-none text-[#1A1817]"
                >
                  <option value="Floral">Floral</option>
                  <option value="Amaderado">Amaderado</option>
                  <option value="Gourmand">Gourmand</option>
                  <option value="Cuero">Cuero</option>
                  <option value="Cítrico">Cítrico</option>
                  <option value="Especiado">Especiado</option>
                </select>
              </div>
              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded bg-[#c59b27] hover:bg-[#D4AF37] text-[#1A1817] font-semibold transition-all cursor-pointer"
                >
                  Guardar en Bóveda
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded bg-[#F5F2EB] text-[#2C2826] border border-[#E6DED1]"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-white text-[#1A1817] px-5 py-3.5 rounded-xl shadow-xl border border-[#E6DED1] flex items-center gap-3">
          <span className="material-symbols-outlined text-[#2D5A27]">verified</span>
          <p className="text-xs font-medium">{notification}</p>
        </div>
      )}
    </div>
  );
};
