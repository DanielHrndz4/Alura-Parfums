import { SaleTransaction, ClientProfile, AbonoTransaction, CartItem } from '../types/sale';
import { LocalStorageAdapter, supabase } from '../db/supabaseClient';

/**
 * Codifica perfume y formato en notes para persistencia en Supabase (tabla clients)
 * sin depender de columnas inexistentes como last_fragrance o last_format.
 */
export function encodeClientNotes(notes: string | undefined, fragrance?: string, format?: string): string | undefined {
  const cleanNotes = (notes || '').replace(/\[PURCHASE:.*?\]\s*/g, '').trim();
  if (!fragrance && !format) return cleanNotes || undefined;
  const meta = JSON.stringify({ f: fragrance, fmt: format });
  const tag = `[PURCHASE:${meta}]`;
  return cleanNotes ? `${tag} ${cleanNotes}` : tag;
}

export function decodeClientNotes(rawNotes: string | undefined): { notes?: string; fragrance?: string; format?: string } {
  if (!rawNotes) return {};
  const match = rawNotes.match(/\[PURCHASE:(.*?)\]/);
  let fragrance: string | undefined;
  let format: string | undefined;
  const notes = rawNotes.replace(/\[PURCHASE:.*?\]\s*/g, '').trim() || undefined;
  if (match && match[1]) {
    try {
      const parsed = JSON.parse(match[1]);
      fragrance = parsed.f;
      format = parsed.fmt;
    } catch {
      // ignore
    }
  }
  return { notes, fragrance, format };
}

export class SalesRepository {
  private static STORAGE_KEY = 'sales_transactions';
  private static CLIENTS_KEY = 'clients_profiles';
  private static ABONOS_KEY = 'abonos_history';

  static getAll(): SaleTransaction[] {
    const list = LocalStorageAdapter.get<SaleTransaction[]>(this.STORAGE_KEY, []);
    return list.filter((s) => !s.id.startsWith('#AB-'));
  }

  static async fetchSalesFromSupabase(): Promise<SaleTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('sales_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return this.getAll();

      const mapped: SaleTransaction[] = data
        .filter((d: any) => !d.id.startsWith('#AB-'))
        .map((d: any) => ({
        id: d.id,
        time: d.time,
        date: d.date,
        clientName: d.client_name,
        clientType: d.client_type,
        fragranceName: d.fragrance_name,
        house: d.house,
        format: d.format,
        paymentMethod: d.payment_method,
        paymentMethodLabel: d.payment_method_label,
        subtotal: Number(d.subtotal),
        discount: Number(d.discount),
        total: Number(d.total),
        status: d.status,
        notes: d.notes,
      }));

      if (mapped.length > 0) {
        LocalStorageAdapter.set(this.STORAGE_KEY, mapped);
        return mapped;
      }
      return this.getAll();
    } catch {
      return this.getAll();
    }
  }

  static async fetchClientsFromSupabase(): Promise<ClientProfile[]> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name', { ascending: true });

      if (error || !data) return this.getClients();

      const localClients = this.getClients();
      const localMap = new Map(localClients.map((c) => [c.id, c]));

      const mapped: ClientProfile[] = data.map((d: any) => {
        const decoded = decodeClientNotes(d.notes);
        const local = localMap.get(d.id);

        const fragrance = d.last_fragrance || decoded.fragrance || local?.lastFragrance;
        const format = d.last_format || decoded.format || local?.lastFormat;

        return {
          id: d.id,
          name: d.name,
          code: d.code,
          tier: d.tier,
          pendingBalance: Number(d.pending_balance),
          lastPurchase: d.last_purchase,
          favoriteHouse: d.favorite_house,
          lastFragrance: fragrance,
          lastFormat: format,
          phone: d.phone,
          notes: decoded.notes,
        };
      });

      if (mapped.length > 0) {
        LocalStorageAdapter.set(this.CLIENTS_KEY, mapped);
        return mapped;
      }
      return this.getClients();
    } catch {
      return this.getClients();
    }
  }

  static async fetchAbonosFromSupabase(): Promise<AbonoTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('abonos_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return this.getAbonos();

      const mapped: AbonoTransaction[] = data.map((d: any) => ({
        id: d.id,
        date: d.date,
        time: d.time,
        clientId: d.client_id,
        clientName: d.client_name,
        clientCode: d.client_code,
        clientTier: d.client_tier,
        amount: Number(d.amount),
        remainingBalance: Number(d.remaining_balance),
        paymentMethod: d.payment_method,
        paymentMethodLabel: d.payment_method_label,
        reference: d.reference,
        status: d.status,
      }));

      if (mapped.length > 0) {
        LocalStorageAdapter.set(this.ABONOS_KEY, mapped);
        return mapped;
      }
      return this.getAbonos();
    } catch {
      return this.getAbonos();
    }
  }

  static add(sale: SaleTransaction): void {
    const list = this.getAll();
    list.unshift(sale);
    LocalStorageAdapter.set(this.STORAGE_KEY, list);

    try {
      supabase
        .from('sales_transactions')
        .insert({
          id: sale.id,
          time: sale.time,
          date: sale.date,
          client_name: sale.clientName,
          client_type: sale.clientType || 'Cliente',
          fragrance_name: sale.fragranceName,
          house: sale.house,
          format: sale.format,
          payment_method: sale.paymentMethod,
          payment_method_label: sale.paymentMethodLabel,
          subtotal: sale.subtotal,
          discount: sale.discount,
          total: sale.total,
          status: sale.status,
          notes: sale.notes,
        })
        .then();
    } catch (e) {
      console.warn('Supabase sale insert error:', e);
    }
  }

  /**
   * Registra o actualiza la compra de un cliente:
   * - Sincroniza el perfume adquirido (lastFragrance)
   * - Sincroniza el formato exacto ('100ml' o '50ml')
   * - Sincroniza la casa preferida y la fecha de última compra
   * - Ajusta el saldo pendiente si hubo crédito (credit50 o credit100)
   * - Guarda en LocalStorage y persiste en Supabase
   */
  /**
   * Empareja la compra con el cliente únicamente en el momento en que se efectúa una venta en el POS:
   * - Sincroniza la fragancia comprada con su respectiva cantidad (ej. 'Uomo Born in Roma (x1)')
   * - Sincroniza el formato exacto ('100ml' o '50ml')
   * - Sincroniza la casa / Maison y fecha de última compra
   * - Ajusta el saldo pendiente si hubo modalidad de crédito
   * - Persiste en LocalStorage y Supabase sin errores de esquema
   */
  static recordSaleForClient(sale: SaleTransaction, items: CartItem[] = [], creditAmount: number = 0): void {
    const clients = this.getClients();
    const rawName = sale.clientName ? sale.clientName.trim() : 'Cliente Mostrador';
    if (!rawName || rawName.toLowerCase() === 'cliente mostrador') return;

    const cleanName = rawName.split('(')[0].trim();
    const clientCodeMatch = rawName.match(/CLI-\d+/i);
    const clientCode = clientCodeMatch ? clientCodeMatch[0].toUpperCase() : '';

    // Buscar cliente existente de forma exacta (código, nombre exacto o nombre limpio exacto)
    let client = clients.find((c) => {
      if (clientCode && c.code && c.code.toUpperCase() === clientCode) return true;
      if (c.name.toLowerCase() === rawName.toLowerCase()) return true;
      if (cleanName && c.name.toLowerCase().trim() === cleanName.toLowerCase().trim()) return true;
      return false;
    });

    // Extraer fragancia real con su respectiva cantidad
    const fragrance =
      items && items.length > 0
        ? items.map((i) => `${i.name} (x${i.quantity || 1})`).join(', ')
        : sale.fragranceName;

    // Normalizar formato ('100ml' o '50ml')
    const rawFormat = (items && items[0]?.format) || sale.format || '100ml';
    const normalizedFormat = rawFormat.toLowerCase().includes('50ml') ? '50ml' : '100ml';
    const house = (items && items[0]?.house) || sale.house || 'Maison Alura';

    if (client) {
      if (creditAmount > 0) {
        client.pendingBalance = Number((client.pendingBalance + creditAmount).toFixed(2));
      }
      client.lastPurchase = `Hoy ${sale.time}`;
      if (fragrance && !fragrance.toLowerCase().includes('artículos atelier')) {
        client.lastFragrance = fragrance;
      } else if (!client.lastFragrance) {
        client.lastFragrance = sale.fragranceName;
      }
      client.lastFormat = normalizedFormat;
      if (house && house !== 'Maison Alura') {
        client.favoriteHouse = house;
      }
    } else {
      client = {
        id: `c-${Date.now()}`,
        name: cleanName,
        code: clientCode || `CLI-${Math.floor(100 + Math.random() * 900)}`,
        tier: 'Cliente',
        pendingBalance: Number(creditAmount.toFixed(2)),
        lastPurchase: `Hoy ${sale.time}`,
        favoriteHouse: house || 'Maison Alura',
        lastFragrance: fragrance || sale.fragranceName,
        lastFormat: normalizedFormat,
      };
      clients.push(client);
    }

    this.saveClients(clients);

    const encodedNotes = encodeClientNotes(client.notes, client.lastFragrance, client.lastFormat);

    try {
      supabase
        .from('clients')
        .upsert({
          id: client.id,
          name: client.name,
          code: client.code,
          tier: client.tier,
          pending_balance: client.pendingBalance,
          last_purchase: client.lastPurchase,
          favorite_house: client.favoriteHouse,
          phone: client.phone,
          notes: encodedNotes,
          updated_at: new Date().toISOString(),
        })
        .then(({ error }) => {
          if (error) console.warn('Supabase client sale sync error:', error);
        });
    } catch (e) {
      console.warn('Supabase client sale sync error:', e);
    }
  }

  static recordCreditForSale(sale: SaleTransaction, creditAmount: number): void {
    this.recordSaleForClient(sale, [], creditAmount);
  }

  /**
   * Sincronización automática deshabilitada por petición de usuario.
   * El emparejamiento de perfume y cantidad se realiza exclusivamente al cobrar en el POS.
   */
  static async syncClientsWithSalesHistory(): Promise<{ updatedCount: number; clients: ClientProfile[] }> {
    return { updatedCount: 0, clients: this.getClients() };
  }

  static getClients(): ClientProfile[] {
    return LocalStorageAdapter.get<ClientProfile[]>(this.CLIENTS_KEY, []);
  }

  static saveClients(clients: ClientProfile[]): void {
    LocalStorageAdapter.set(this.CLIENTS_KEY, clients);
  }

  static async addClient(clientData: {
    name: string;
    phone?: string;
    favoriteHouse?: string;
    tier?: string;
    initialBalance?: number;
    notes?: string;
  }): Promise<ClientProfile> {
    const clients = this.getClients();
    const newClient: ClientProfile = {
      id: `c-${Date.now()}`,
      name: clientData.name.trim(),
      code: `CLI-${Math.floor(100 + Math.random() * 900)}`,
      tier: clientData.tier?.trim() || 'Cliente',
      pendingBalance: Number(Number(clientData.initialBalance || 0).toFixed(2)),
      lastPurchase: 'Nuevo registro',
      favoriteHouse: clientData.favoriteHouse?.trim() || 'Maison Alura',
      phone: clientData.phone?.trim() || undefined,
      notes: clientData.notes?.trim() || undefined,
    };

    clients.unshift(newClient);
    this.saveClients(clients);

    try {
      const { error } = await supabase
        .from('clients')
        .insert({
          id: newClient.id,
          name: newClient.name,
          code: newClient.code,
          tier: newClient.tier,
          pending_balance: newClient.pendingBalance,
          last_purchase: newClient.lastPurchase,
          favorite_house: newClient.favoriteHouse,
          phone: newClient.phone,
          notes: newClient.notes,
        });
      if (error) {
        console.warn('Supabase client insert error:', error);
      }
    } catch (e) {
      console.warn('Supabase client insert error:', e);
    }

    return newClient;
  }

  static async updateClient(updatedClient: ClientProfile): Promise<ClientProfile> {
    const clients = this.getClients();
    const idx = clients.findIndex((c) => c.id === updatedClient.id);
    if (idx !== -1) {
      clients[idx] = {
        ...clients[idx],
        ...updatedClient,
        pendingBalance: Number(Number(updatedClient.pendingBalance || 0).toFixed(2)),
      };
      this.saveClients(clients);

      const encodedNotes = encodeClientNotes(updatedClient.notes, updatedClient.lastFragrance, updatedClient.lastFormat);

      try {
        const { error } = await supabase
          .from('clients')
          .update({
            name: updatedClient.name,
            code: updatedClient.code,
            tier: updatedClient.tier,
            pending_balance: updatedClient.pendingBalance,
            last_purchase: updatedClient.lastPurchase,
            favorite_house: updatedClient.favoriteHouse,
            phone: updatedClient.phone,
            notes: encodedNotes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', updatedClient.id);

        if (error) {
          console.warn('Supabase client update error:', error);
        }
      } catch (e) {
        console.warn('Supabase client update error:', e);
      }
    }
    return updatedClient;
  }

  static deleteClient(id: string): void {
    const clients = this.getClients().filter((c) => c.id !== id);
    this.saveClients(clients);
    try {
      supabase.from('clients').delete().eq('id', id).then();
    } catch (e) {
      console.warn('Supabase client delete error:', e);
    }
  }

  static deleteAbono(id: string): { client?: ClientProfile; revertedAmount: number } | null {
    const abonos = this.getAbonos();
    const abonoToDelete = abonos.find((a) => a.id === id);
    if (!abonoToDelete) return null;

    // 1. Eliminar de historial de abonos
    const updatedAbonos = abonos.filter((a) => a.id !== id);
    LocalStorageAdapter.set(this.ABONOS_KEY, updatedAbonos);

    // 2. Eliminar del libro diario de ventas si estaba replicado
    const sales = this.getAll().filter((s) => s.id !== id);
    LocalStorageAdapter.set(this.STORAGE_KEY, sales);

    // 3. Revertir saldo pendiente al cliente (restituir deuda)
    const clients = this.getClients();
    let updatedClient: ClientProfile | undefined;
    const updatedClients = clients.map((c) => {
      const matchId = abonoToDelete.clientId && c.id === abonoToDelete.clientId;
      const matchName = c.name.toLowerCase() === abonoToDelete.clientName.toLowerCase();
      if (matchId || matchName) {
        const restoredBalance = Number((c.pendingBalance + abonoToDelete.amount).toFixed(2));
        updatedClient = {
          ...c,
          pendingBalance: restoredBalance,
        };
        return updatedClient;
      }
      return c;
    });
    this.saveClients(updatedClients);

    // 4. Sincronizar en Supabase
    try {
      supabase.from('abonos_transactions').delete().eq('id', id).then();
      supabase.from('sales_transactions').delete().eq('id', id).then();
      if (updatedClient) {
        supabase
          .from('clients')
          .update({
            pending_balance: updatedClient.pendingBalance,
            updated_at: new Date().toISOString(),
          })
          .eq('id', updatedClient.id)
          .then();
      }
    } catch (e) {
      console.warn('Supabase delete abono sync error:', e);
    }

    return { client: updatedClient, revertedAmount: abonoToDelete.amount };
  }

  static deleteSale(id: string): boolean {
    const sales = this.getAll();
    const saleToDelete = sales.find((s) => s.id === id);
    if (!saleToDelete) return false;

    // 1. Eliminar del listado de ventas
    const updatedSales = sales.filter((s) => s.id !== id);
    LocalStorageAdapter.set(this.STORAGE_KEY, updatedSales);

    // 2. Si era un abono registrado con ID de abono
    if (saleToDelete.id.startsWith('#AB-')) {
      const updatedAbonos = this.getAbonos().filter((a) => a.id !== id);
      LocalStorageAdapter.set(this.ABONOS_KEY, updatedAbonos);
      try {
        supabase.from('abonos_transactions').delete().eq('id', id).then();
      } catch (e) {
        console.warn('Supabase delete abono error:', e);
      }
    }

    // 3. Si era una venta a crédito, revertir la deuda añadida al cliente
    if (saleToDelete.paymentMethod === 'credit100' || saleToDelete.paymentMethod === 'credit50') {
      const creditToRevert = saleToDelete.paymentMethod === 'credit100' ? saleToDelete.total : saleToDelete.total / 2;
      const clients = this.getClients();
      let affectedClient: ClientProfile | undefined;
      const updatedClients = clients.map((c) => {
        if (c.name.toLowerCase() === saleToDelete.clientName.toLowerCase()) {
          affectedClient = {
            ...c,
            pendingBalance: Math.max(0, Number((c.pendingBalance - creditToRevert).toFixed(2))),
          };
          return affectedClient;
        }
        return c;
      });
      this.saveClients(updatedClients);
      if (affectedClient) {
        try {
          supabase
            .from('clients')
            .update({ pending_balance: affectedClient.pendingBalance, updated_at: new Date().toISOString() })
            .eq('id', affectedClient.id)
            .then();
        } catch (e) {
          console.warn('Supabase client revert credit error:', e);
        }
      }
    }

    // 4. Supabase delete
    try {
      supabase.from('sales_transactions').delete().eq('id', id).then();
    } catch (e) {
      console.warn('Supabase sale delete error:', e);
    }

    return true;
  }

  static getAbonos(): AbonoTransaction[] {
    return LocalStorageAdapter.get<AbonoTransaction[]>(this.ABONOS_KEY, []);
  }

  static addAbono(record: AbonoTransaction): void {
    const history = this.getAbonos();
    history.unshift(record);
    LocalStorageAdapter.set(this.ABONOS_KEY, history);
  }

  static recordAbono(
    clientId: string,
    amount: number,
    paymentMethod: 'cash' | 'pos' | 'transfer' = 'cash',
    notes?: string
  ): { client: ClientProfile; newBalance: number } | null {
    const clients = this.getClients();
    let updatedClient: ClientProfile | null = null;
    const updated = clients.map((c) => {
      if (c.id === clientId) {
        const newBalance = Math.max(0, Number((c.pendingBalance - amount).toFixed(2)));
        updatedClient = {
          ...c,
          pendingBalance: newBalance,
          lastPurchase: 'Hoy ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        return updatedClient;
      }
      return c;
    });

    if (updatedClient) {
      LocalStorageAdapter.set(this.CLIENTS_KEY, updated);

      const methodLabels: Record<string, string> = {
        cash: 'Efectivo',
        pos: 'Terminal POS',
        transfer: 'Transferencia / Zelle',
      };

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const dateStr = `Hoy, ${now.getDate()} ${months[now.getMonth()]}`;

      // 1. Add to Abonos specific history
      const abonoEntry: AbonoTransaction = {
        id: `#AB-${Date.now().toString().slice(-4)}`,
        date: 'Hoy',
        time: timeStr,
        clientId: (updatedClient as ClientProfile).id,
        clientName: (updatedClient as ClientProfile).name,
        clientCode: (updatedClient as ClientProfile).code,
        clientTier: (updatedClient as ClientProfile).tier,
        amount: amount,
        remainingBalance: (updatedClient as ClientProfile).pendingBalance,
        paymentMethod: paymentMethod,
        paymentMethodLabel: methodLabels[paymentMethod] || 'Efectivo',
        reference: notes || undefined,
        status: 'Completado',
      };
      this.addAbono(abonoEntry);

      // 2. ACTUALIZAR la venta ya creada en lugar de crear una nueva en el libro de ventas
      const sales = this.getAll();
      const cleanClientName = ((updatedClient as ClientProfile).name || '').toLowerCase().split('(')[0].trim();
      const clientCode = ((updatedClient as ClientProfile).code || '').toLowerCase().trim();

      let remainingAbono = amount;
      const updatedSales = sales.map((s) => {
        if (s.status !== 'Completado') {
          const sName = (s.clientName || '').toLowerCase().trim();
          const matchesName =
            sName === ((updatedClient as ClientProfile).name || '').toLowerCase().trim() ||
            (cleanClientName && (sName.startsWith(cleanClientName) || cleanClientName.startsWith(sName)));
          const matchesCode = clientCode && s.clientName.toLowerCase().includes(clientCode);

          if (matchesName || matchesCode) {
            // Si el cliente liquidó la totalidad o el abono cubre el total de esta venta:
            if ((updatedClient as ClientProfile).pendingBalance === 0 || remainingAbono >= s.total) {
              s.status = 'Completado';
              s.paymentMethod = paymentMethod;
              s.paymentMethodLabel = `${methodLabels[paymentMethod] || 'Efectivo'} (Liquidado)`;
              remainingAbono -= s.total;

              // Actualizar el ticket existente en Supabase
              try {
                supabase
                  .from('sales_transactions')
                  .update({
                    status: 'Completado',
                    payment_method: s.paymentMethod,
                    payment_method_label: s.paymentMethodLabel,
                  })
                  .eq('id', s.id)
                  .then();
              } catch (e) {
                console.warn('Supabase sale status update error:', e);
              }
            } else if (remainingAbono > 0) {
              // Abono parcial
              s.status = 'Apartado 50%';
              s.paymentMethodLabel = `Abono Parcial (${methodLabels[paymentMethod] || 'Efectivo'})`;
              try {
                supabase
                  .from('sales_transactions')
                  .update({
                    status: s.status,
                    payment_method_label: s.paymentMethodLabel,
                  })
                  .eq('id', s.id)
                  .then();
              } catch (e) {
                console.warn('Supabase sale status update error:', e);
              }
            }
          }
        }
        return s;
      });

      // Guardar ventas actualizadas (sin duplicar ni crear nuevo ticket en libro diario)
      LocalStorageAdapter.set(this.STORAGE_KEY, updatedSales);

      // 3. Sync to Supabase
      try {
        supabase
          .from('abonos_transactions')
          .insert({
            id: abonoEntry.id,
            date: abonoEntry.date,
            time: abonoEntry.time,
            client_id: abonoEntry.clientId,
            client_name: abonoEntry.clientName,
            client_code: abonoEntry.clientCode,
            client_tier: abonoEntry.clientTier,
            amount: abonoEntry.amount,
            remaining_balance: abonoEntry.remainingBalance,
            payment_method: abonoEntry.paymentMethod,
            payment_method_label: abonoEntry.paymentMethodLabel,
            reference: abonoEntry.reference,
            status: abonoEntry.status,
          })
          .then();

        supabase
          .from('clients')
          .update({
            pending_balance: (updatedClient as ClientProfile).pendingBalance,
            last_purchase: (updatedClient as ClientProfile).lastPurchase,
          })
          .eq('id', (updatedClient as ClientProfile).id)
          .then();
      } catch (e) {
        console.warn('Supabase abono sync error:', e);
      }
    }

    return updatedClient ? { client: updatedClient, newBalance: (updatedClient as ClientProfile).pendingBalance } : null;
  }

  static getDailyTotal(): number {
    const sales = this.getAll();
    return sales.reduce((acc, curr) => acc + curr.total, 0);
  }
}
