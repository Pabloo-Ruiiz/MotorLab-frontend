// Marcas de coche conocidas y sus modelos desde 1980, el año mínimo que admite el formulario.
// El orden de estas listas da igual: MARCAS y modelosDe() las devuelven ya ordenadas.
const CATALOGO: Readonly<Record<string, readonly string[]>> = {
  Abarth: ['124 Spider', '500', '500e', '595', '600e', '695', 'Grande Punto', 'Punto Evo'],
  Acura: ['ILX', 'Integra', 'MDX', 'NSX', 'RDX', 'RLX', 'TL', 'TLX', 'TSX'],
  'Alfa Romeo': [
    '33', '75', '145', '146', '147', '155', '156', '159', '164', '166', '4C', '8C', 'Brera',
    'Giulia', 'Giulietta', 'GT', 'GTV', 'Junior', 'MiTo', 'Spider', 'Stelvio', 'Tonale'
  ],
  Alpine: ['A110', 'A290', 'A390'],
  'Aston Martin': [
    'Cygnet', 'DB7', 'DB9', 'DB11', 'DB12', 'DBS', 'DBX', 'Rapide', 'V8 Vantage', 'Vanquish',
    'Vantage', 'Virage'
  ],
  Audi: [
    '80', '90', '100', '200', 'A1', 'A2', 'A3', 'A4', 'A4 Allroad', 'A5', 'A6', 'A6 Allroad',
    'A6 e-tron', 'A7', 'A8', 'Cabriolet', 'Coupé', 'e-tron', 'e-tron GT', 'Q2', 'Q3', 'Q4 e-tron',
    'Q5', 'Q6 e-tron', 'Q7', 'Q8', 'Q8 e-tron', 'R8', 'RS3', 'RS4', 'RS5', 'RS6', 'RS7', 'RS Q3',
    'RS Q8', 'S1', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'SQ5', 'SQ7', 'SQ8', 'TT', 'V8'
  ],
  Bentley: [
    'Arnage', 'Azure', 'Bentayga', 'Brooklands', 'Continental GT', 'Continental GTC',
    'Flying Spur', 'Mulsanne', 'Turbo R'
  ],
  BMW: [
    'i3', 'i4', 'i5', 'i7', 'i8', 'iX', 'iX1', 'iX2', 'iX3', 'M2', 'M3', 'M4', 'M5', 'M6', 'M8',
    'Serie 1', 'Serie 2', 'Serie 2 Active Tourer', 'Serie 2 Gran Coupé', 'Serie 2 Gran Tourer',
    'Serie 3', 'Serie 3 Gran Turismo', 'Serie 4', 'Serie 4 Gran Coupé', 'Serie 5',
    'Serie 5 Gran Turismo', 'Serie 6', 'Serie 6 Gran Turismo', 'Serie 7', 'Serie 8', 'X1', 'X2',
    'X3', 'X3 M', 'X4', 'X4 M', 'X5', 'X5 M', 'X6', 'X6 M', 'X7', 'XM', 'Z1', 'Z3', 'Z4', 'Z8'
  ],
  Buick: ['Enclave', 'Encore', 'Envision', 'LaCrosse', 'LeSabre', 'Park Avenue', 'Regal', 'Riviera'],
  BYD: [
    'Atto 2', 'Atto 3', 'Dolphin', 'Dolphin Surf', 'Han', 'Seal', 'Seal U', 'Sealion 7', 'Tang'
  ],
  Cadillac: [
    'ATS', 'BLS', 'CT4', 'CT5', 'CT6', 'CTS', 'DeVille', 'DTS', 'Eldorado', 'Escalade', 'Lyriq',
    'Seville', 'SRX', 'STS', 'XT4', 'XT5', 'XT6', 'XTS'
  ],
  Chevrolet: [
    'Aveo', 'Blazer', 'Camaro', 'Captiva', 'Corvette', 'Cruze', 'Epica', 'Equinox', 'Evanda',
    'Impala', 'Kalos', 'Lacetti', 'Malibu', 'Matiz', 'Nubira', 'Orlando', 'Silverado', 'Spark',
    'Suburban', 'Tacuma', 'Tahoe', 'Trax', 'Volt'
  ],
  Chrysler: [
    '300C', '300M', 'Crossfire', 'Grand Voyager', 'Neon', 'Pacifica', 'PT Cruiser', 'Sebring',
    'Stratus', 'Vision', 'Voyager'
  ],
  Citroën: [
    '2CV', 'Ami', 'AX', 'Berlingo', 'BX', 'C-Crosser', 'C-Elysée', 'C-Zero', 'C1', 'C15', 'C2',
    'C3', 'C3 Aircross', 'C3 Picasso', 'C4', 'C4 Aircross', 'C4 Cactus', 'C4 Picasso',
    'C4 SpaceTourer', 'C4 X', 'C5', 'C5 Aircross', 'C5 X', 'C6', 'C8', 'CX', 'DS3', 'DS4', 'DS5',
    'Evasion', 'Grand C4 Picasso', 'Grand C4 SpaceTourer', 'Jumper', 'Jumpy', 'Nemo', 'Saxo',
    'SpaceTourer', 'Visa', 'Xantia', 'XM', 'Xsara', 'Xsara Picasso', 'ZX'
  ],
  Cupra: ['Ateca', 'Born', 'Formentor', 'León', 'Tavascan', 'Terramar'],
  Dacia: ['Bigster', 'Dokker', 'Duster', 'Jogger', 'Lodgy', 'Logan', 'Sandero', 'Spring'],
  Daewoo: [
    'Aranos', 'Espero', 'Evanda', 'Kalos', 'Korando', 'Lacetti', 'Lanos', 'Leganza', 'Matiz',
    'Musso', 'Nexia', 'Nubira', 'Rezzo', 'Tacuma'
  ],
  Daihatsu: [
    'Applause', 'Charade', 'Copen', 'Cuore', 'Feroza', 'Materia', 'Move', 'Rocky', 'Sirion',
    'Terios', 'Trevis', 'YRV'
  ],
  Dodge: [
    'Avenger', 'Caliber', 'Challenger', 'Charger', 'Dakota', 'Durango', 'Grand Caravan', 'Journey',
    'Magnum', 'Neon', 'Nitro', 'Ram', 'Stealth', 'Viper'
  ],
  DS: ['DS 3', 'DS 3 Crossback', 'DS 4', 'DS 5', 'DS 7', 'DS 7 Crossback', 'DS 9', 'N°8'],
  Ferrari: [
    '12Cilindri', '296 GTB', '296 GTS', '348', '360', '456', '458', '488', '512 TR',
    '550 Maranello', '575M', '599', '612 Scaglietti', '812', 'California', 'Enzo', 'F12', 'F355',
    'F40', 'F430', 'F50', 'F8', 'FF', 'GTC4Lusso', 'LaFerrari', 'Mondial', 'Portofino',
    'Purosangue', 'Roma', 'SF90', 'Testarossa'
  ],
  Fiat: [
    '124 Spider', '126', '127', '500', '500C', '500e', '500L', '500X', '600', '600e', 'Barchetta',
    'Brava', 'Bravo', 'Cinquecento', 'Coupé', 'Croma', 'Doblò', 'Ducato', 'Fiorino', 'Freemont',
    'Grande Panda', 'Grande Punto', 'Idea', 'Linea', 'Marea', 'Multipla', 'Palio', 'Panda',
    'Punto', 'Punto Evo', 'Qubo', 'Regata', 'Ritmo', 'Scudo', 'Sedici', 'Seicento', 'Stilo',
    'Talento', 'Tempra', 'Tipo', 'Topolino', 'Ulysse', 'Uno'
  ],
  Ford: [
    'B-Max', 'Bronco', 'C-Max', 'Capri', 'Cougar', 'Courier', 'Edge', 'Escape', 'Escort',
    'Expedition', 'Explorer', 'F-150', 'Fiesta', 'Focus', 'Focus C-Max', 'Fusion', 'Galaxy',
    'Granada', 'Grand C-Max', 'Ka', 'Ka+', 'Kuga', 'Maverick', 'Mondeo', 'Mustang',
    'Mustang Mach-E', 'Orion', 'Probe', 'Puma', 'Ranger', 'S-Max', 'Scorpio', 'Sierra',
    'Tourneo Connect', 'Tourneo Courier', 'Tourneo Custom', 'Transit', 'Transit Connect',
    'Transit Custom'
  ],
  Genesis: ['G70', 'G80', 'G90', 'GV60', 'GV70', 'GV80'],
  GMC: ['Acadia', 'Canyon', 'Envoy', 'Hummer EV', 'Sierra', 'Terrain', 'Yukon'],
  Honda: [
    'Accord', 'City', 'Civic', 'CR-V', 'CR-X', 'CR-Z', 'e', 'e:Ny1', 'FR-V', 'HR-V', 'Insight',
    'Integra', 'Jazz', 'Legend', 'NSX', 'Odyssey', 'Pilot', 'Prelude', 'S2000', 'Shuttle',
    'Stream', 'ZR-V'
  ],
  Hummer: ['H1', 'H2', 'H3'],
  Hyundai: [
    'Accent', 'Atos', 'Bayon', 'Coupé', 'Elantra', 'Galloper', 'Genesis Coupé', 'Getz',
    'Grand Santa Fe', 'H-1', 'i10', 'i20', 'i30', 'i40', 'Inster', 'Ioniq', 'Ioniq 5', 'Ioniq 6',
    'ix20', 'ix35', 'ix55', 'Kona', 'Lantra', 'Matrix', 'Nexo', 'Pony', 'Santa Fe', 'Sonata',
    'Staria', 'Terracan', 'Trajet', 'Tucson', 'Veloster', 'XG'
  ],
  Infiniti: [
    'EX', 'FX', 'G', 'M', 'Q30', 'Q50', 'Q60', 'Q70', 'QX30', 'QX50', 'QX60', 'QX70', 'QX80'
  ],
  Isuzu: ['D-Max', 'Gemini', 'Rodeo', 'Trooper'],
  Jaecoo: ['5', '7'],
  Jaguar: [
    'E-Pace', 'F-Pace', 'F-Type', 'I-Pace', 'S-Type', 'X-Type', 'XE', 'XF', 'XJ', 'XJ8', 'XJS',
    'XK', 'XK8'
  ],
  Jeep: [
    'Avenger', 'Cherokee', 'Commander', 'Compass', 'Gladiator', 'Grand Cherokee', 'Patriot',
    'Renegade', 'Wagoneer', 'Wrangler'
  ],
  KGM: ['Actyon', 'Korando', 'Musso', 'Rexton', 'Tivoli', 'Torres'],
  Kia: [
    'Carens', 'Carnival', 'Ceed', 'Cerato', 'Clarus', 'EV3', 'EV4', 'EV6', 'EV9', 'Magentis',
    'Niro', 'Opirus', 'Optima', 'Picanto', 'ProCeed', 'Retona', 'Rio', 'Sephia', 'Shuma',
    'Sorento', 'Soul', 'Sportage', 'Stinger', 'Stonic', 'Venga', 'XCeed'
  ],
  Lamborghini: [
    'Aventador', 'Countach', 'Diablo', 'Gallardo', 'Huracán', 'Murciélago', 'Revuelto',
    'Temerario', 'Urus'
  ],
  Lancia: [
    'Beta', 'Dedra', 'Delta', 'Flavia', 'Kappa', 'Lybra', 'Musa', 'Phedra', 'Prisma', 'Thema',
    'Thesis', 'Voyager', 'Y', 'Y10', 'Ypsilon', 'Zeta'
  ],
  'Land Rover': [
    'Defender', 'Discovery', 'Discovery Sport', 'Freelander', 'Range Rover', 'Range Rover Evoque',
    'Range Rover Sport', 'Range Rover Velar'
  ],
  Lexus: [
    'CT', 'ES', 'GS', 'GX', 'IS', 'LBX', 'LC', 'LFA', 'LM', 'LS', 'LX', 'NX', 'RC', 'RX', 'RZ',
    'SC', 'UX'
  ],
  Lincoln: ['Aviator', 'Continental', 'Corsair', 'MKC', 'MKZ', 'Navigator', 'Town Car'],
  Lotus: ['Elan', 'Eletre', 'Elise', 'Emeya', 'Emira', 'Esprit', 'Evora', 'Excel', 'Exige'],
  'Lynk & Co': ['01', '02', '08'],
  Maserati: [
    '3200 GT', 'Biturbo', 'Coupé', 'Ghibli', 'GranCabrio', 'GranSport', 'GranTurismo', 'Grecale',
    'Levante', 'MC20', 'Quattroporte', 'Shamal', 'Spyder'
  ],
  Mazda: [
    '121', '2', '3', '323', '5', '6', '626', '6e', 'BT-50', 'CX-3', 'CX-30', 'CX-5', 'CX-60',
    'CX-7', 'CX-80', 'CX-9', 'Demio', 'MPV', 'MX-3', 'MX-30', 'MX-5', 'MX-6', 'Premacy', 'RX-7',
    'RX-8', 'Tribute', 'Xedos 6', 'Xedos 9'
  ],
  McLaren: [
    '540C', '570GT', '570S', '600LT', '650S', '675LT', '720S', '750S', '765LT', 'Artura', 'F1',
    'GT', 'MP4-12C', 'P1', 'Senna'
  ],
  'Mercedes-Benz': [
    '190', 'AMG GT', 'Citan', 'Clase A', 'Clase B', 'Clase C', 'Clase CL', 'Clase CLA',
    'Clase CLC', 'Clase CLK', 'Clase CLS', 'Clase E', 'Clase G', 'Clase GL', 'Clase GLA',
    'Clase GLB', 'Clase GLC', 'Clase GLE', 'Clase GLK', 'Clase GLS', 'Clase M', 'Clase R',
    'Clase S', 'Clase SL', 'Clase SLC', 'Clase SLK', 'Clase T', 'Clase V', 'Clase X', 'EQA', 'EQB',
    'EQC', 'EQE', 'EQE SUV', 'EQS', 'EQS SUV', 'EQV', 'SLR McLaren', 'SLS AMG', 'Sprinter',
    'Vaneo', 'Viano', 'Vito'
  ],
  MG: [
    'Cyberster', 'EHS', 'HS', 'Marvel R', 'MG3', 'MG4', 'MG5', 'MGF', 'S5 EV', 'TF', 'ZR', 'ZS',
    'ZT'
  ],
  Mini: [
    'Aceman', 'Cabrio', 'Clubman', 'Cooper', 'Countryman', 'Coupé', 'John Cooper Works', 'One',
    'Paceman', 'Roadster'
  ],
  Mitsubishi: [
    '3000 GT', 'ASX', 'Carisma', 'Colt', 'Eclipse', 'Eclipse Cross', 'Galant', 'Grandis',
    'i-MiEV', 'L200', 'Lancer', 'Lancer Evolution', 'Montero', 'Montero iO', 'Montero Sport',
    'Outlander', 'Space Runner', 'Space Star', 'Space Wagon'
  ],
  Nissan: [
    '100NX', '200SX', '300ZX', '350Z', '370Z', 'Almera', 'Almera Tino', 'Ariya', 'Bluebird',
    'Cube', 'Evalia', 'GT-R', 'Juke', 'Kubistar', 'Leaf', 'Maxima', 'Micra', 'Murano', 'Navara',
    'Note', 'NV200', 'NV300', 'Pathfinder', 'Patrol', 'Pixo', 'Primastar', 'Primera', 'Pulsar',
    'Qashqai', 'Serena', 'Sunny', 'Terrano', 'Terrano II', 'Tiida', 'Townstar', 'Vanette',
    'X-Trail', 'Z'
  ],
  Omoda: ['5', '9', 'E5'],
  Opel: [
    'Adam', 'Agila', 'Ampera', 'Ampera-e', 'Antara', 'Arena', 'Ascona', 'Astra', 'Calibra',
    'Campo', 'Cascada', 'Combo', 'Corsa', 'Crossland', 'Crossland X', 'Frontera', 'Grandland',
    'Grandland X', 'GT', 'Insignia', 'Kadett', 'Karl', 'Manta', 'Meriva', 'Mokka', 'Mokka X',
    'Monterey', 'Movano', 'Omega', 'Rekord', 'Senator', 'Signum', 'Sintra', 'Speedster', 'Tigra',
    'Vectra', 'Vivaro', 'Zafira', 'Zafira Life'
  ],
  Peugeot: [
    '104', '106', '107', '108', '205', '206', '207', '208', '301', '305', '306', '307', '308',
    '309', '405', '406', '407', '408', '505', '508', '604', '605', '607', '806', '807', '1007',
    '2008', '3008', '4007', '4008', '5008', 'Bipper', 'Boxer', 'Expert', 'iOn', 'Partner', 'RCZ',
    'Rifter', 'Traveller'
  ],
  Polestar: ['1', '2', '3', '4'],
  Pontiac: ['Aztek', 'Bonneville', 'Fiero', 'Firebird', 'G6', 'Grand Am', 'Grand Prix', 'Solstice'],
  Porsche: [
    '718 Boxster', '718 Cayman', '911', '918 Spyder', '924', '928', '944', '968', 'Boxster',
    'Carrera GT', 'Cayenne', 'Cayman', 'Macan', 'Panamera', 'Taycan'
  ],
  Renault: [
    '4', '4 E-Tech', '5', '5 E-Tech', '9', '11', '18', '19', '21', '25', 'Alaskan', 'Arkana',
    'Austral', 'Avantime', 'Captur', 'Clio', 'Espace', 'Express', 'Fluence', 'Fuego', 'Grand Modus',
    'Grand Scenic', 'Kadjar', 'Kangoo', 'Koleos', 'Laguna', 'Latitude', 'Master', 'Megane',
    'Megane E-Tech', 'Modus', 'Rafale', 'Safrane', 'Scenic', 'Symbol', 'Talisman', 'Trafic',
    'Twingo', 'Twizy', 'Vel Satis', 'Wind', 'Zoe'
  ],
  'Rolls-Royce': [
    'Corniche', 'Cullinan', 'Dawn', 'Ghost', 'Park Ward', 'Phantom', 'Silver Seraph',
    'Silver Spirit', 'Silver Spur', 'Spectre', 'Wraith'
  ],
  Rover: ['100', '200', '25', '400', '45', '600', '75', '800', 'Metro', 'Streetwise'],
  Saab: ['900', '9000', '9-3', '9-4X', '9-5', '9-7X'],
  Seat: [
    '127', 'Alhambra', 'Altea', 'Altea XL', 'Arona', 'Arosa', 'Ateca', 'Córdoba', 'Exeo', 'Fura',
    'Ibiza', 'Inca', 'León', 'Málaga', 'Marbella', 'Mii', 'Panda', 'Ronda', 'Tarraco', 'Terra',
    'Toledo'
  ],
  Skoda: [
    'Citigo', 'Elroq', 'Enyaq', 'Fabia', 'Favorit', 'Felicia', 'Kamiq', 'Karoq', 'Kodiaq',
    'Octavia', 'Rapid', 'Roomster', 'Scala', 'Superb', 'Yeti'
  ],
  Smart: ['#1', '#3', '#5', 'Crossblade', 'ForFour', 'ForTwo', 'Roadster'],
  SsangYong: ['Actyon', 'Korando', 'Kyron', 'Musso', 'Rexton', 'Rodius', 'Tivoli', 'Torres', 'XLV'],
  Subaru: [
    'BRZ', 'Crosstrek', 'Forester', 'Impreza', 'Justy', 'Legacy', 'Levorg', 'Outback', 'Solterra',
    'SVX', 'Trezia', 'Tribeca', 'Vivio', 'WRX STI', 'XV'
  ],
  Suzuki: [
    'Across', 'Alto', 'Baleno', 'Celerio', 'Grand Vitara', 'Ignis', 'Jimny', 'Kizashi', 'Liana',
    'S-Cross', 'Samurai', 'SJ', 'Splash', 'Swace', 'Swift', 'SX4', 'SX4 S-Cross', 'Vitara',
    'Wagon R+', 'X-90'
  ],
  Tesla: ['Cybertruck', 'Model 3', 'Model S', 'Model X', 'Model Y', 'Roadster'],
  Toyota: [
    '4Runner', 'Auris', 'Avensis', 'Avensis Verso', 'Aygo', 'Aygo X', 'bZ4X', 'C-HR', 'Camry',
    'Carina', 'Carina E', 'Celica', 'Corolla', 'Corolla Cross', 'Corolla Verso', 'FJ Cruiser',
    'GR86', 'GR Yaris', 'GT86', 'Hiace', 'Highlander', 'Hilux', 'iQ', 'Land Cruiser', 'Mirai',
    'MR2', 'Paseo', 'Picnic', 'Previa', 'Prius', 'Prius+', 'ProAce', 'ProAce City', 'RAV4',
    'Starlet', 'Supra', 'Tacoma', 'Tundra', 'Urban Cruiser', 'Verso', 'Verso-S', 'Yaris',
    'Yaris Cross'
  ],
  Volkswagen: [
    'Amarok', 'Arteon', 'Beetle', 'Bora', 'Caddy', 'California', 'Caravelle', 'Corrado', 'Crafter',
    'Derby', 'Eos', 'Fox', 'Golf', 'Golf Plus', 'Golf Sportsvan', 'ID. Buzz', 'ID.3', 'ID.4',
    'ID.5', 'ID.7', 'Jetta', 'Lupo', 'Multivan', 'New Beetle', 'Passat', 'Passat CC', 'Phaeton',
    'Polo', 'Santana', 'Scirocco', 'Sharan', 'T-Cross', 'T-Roc', 'Taigo', 'Tiguan',
    'Tiguan Allspace', 'Touareg', 'Touran', 'Transporter', 'Up!', 'Vento'
  ],
  Volvo: [
    '240', '340', '360', '440', '460', '480', '740', '760', '850', '940', '960', 'C30', 'C40',
    'C70', 'EC40', 'EX30', 'EX40', 'EX90', 'S40', 'S60', 'S70', 'S80', 'S90', 'V40', 'V50', 'V60',
    'V70', 'V90', 'XC40', 'XC60', 'XC70', 'XC90'
  ]
};

// numeric: el 206 va antes que el 1007, que en orden de texto iría primero
const ordenar = new Intl.Collator('es', { numeric: true }).compare;

const sinAcentosNiMayusculas = (texto: string): string =>
  texto
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim()
    .toLowerCase();

export const MARCAS: readonly string[] = Object.keys(CATALOGO).sort(ordenar);

export function modelosDe(marca: string): readonly string[] {
  return Object.hasOwn(CATALOGO, marca) ? [...CATALOGO[marca]].sort(ordenar) : [];
}

// Los vehículos ya guardados se escribieron a mano: «seat leon» debe reconocerse como «Seat León»
export function buscarEnCatalogo(opciones: readonly string[], valor: string): string | undefined {
  const buscado = sinAcentosNiMayusculas(valor);
  return opciones.find((opcion) => sinAcentosNiMayusculas(opcion) === buscado);
}
