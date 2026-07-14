// Teklif/randevu formlarındaki bağlı marka-model seçimi — tek merkezi kaynak.
// Her markanın listesi "Diğer" ile biter; "Diğer" seçilince serbest metin açılır.

export interface VehicleBrand {
  name: string;
  models: string[];
}

export const OTHER_OPTION = 'Diğer';

export const vehicleBrands: VehicleBrand[] = [
  { name: 'Mercedes-Benz', models: ['Vito', 'V-Class', 'Sprinter', OTHER_OPTION] },
  { name: 'Volkswagen', models: ['Transporter', 'Caravelle', 'Multivan', 'Crafter', OTHER_OPTION] },
  { name: 'Ford', models: ['Tourneo Custom', 'Transit Custom', 'Transit', OTHER_OPTION] },
  { name: 'Renault', models: ['Trafic', 'Master', OTHER_OPTION] },
  { name: 'Fiat', models: ['Scudo', 'Ulysse', 'Ducato', OTHER_OPTION] },
  { name: 'Peugeot', models: ['Traveller', 'Expert', 'Boxer', OTHER_OPTION] },
  { name: 'Citroën', models: ['SpaceTourer', 'Jumpy', 'Jumper', OTHER_OPTION] },
  { name: 'Opel', models: ['Zafira Life', 'Vivaro', 'Movano', OTHER_OPTION] },
  { name: 'Toyota', models: ['Proace Verso', 'Proace', 'Proace Max', OTHER_OPTION] },
  { name: 'Iveco', models: ['Daily', OTHER_OPTION] },
  { name: 'MAN', models: ['TGE', OTHER_OPTION] },
  { name: OTHER_OPTION, models: [] },
];
