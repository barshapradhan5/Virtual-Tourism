from django.core.management.base import BaseCommand
from apps.places.models import Category, State, Place, POI, Media

class Command(BaseCommand):
    help = 'Seeds all 7 categories, Indian states, and at least 3 distinct spots per category (21 total destinations)'

    def handle(self, *args, **options):
        self.stdout.write("Seeding categories...")
        categories_data = [
            {
                "name": "Temples and sacred shrines",
                "slug": "temples-and-sacred-shrines",
                "icon": "Church",
                "theme_color": "#D97706",
                "description": "Ancient and revered spiritual sanctuaries steeped in ritual, classical architecture, and timeless devotion.",
                "order": 1
            },
            {
                "name": "Monuments",
                "slug": "monuments",
                "icon": "Landmark",
                "theme_color": "#7A1F36",
                "description": "Grand historical fortresses, mausoleums, and imperial palaces echoing dynasties past.",
                "order": 2
            },
            {
                "name": "Beach resorts",
                "slug": "beach-resorts",
                "icon": "Palmtree",
                "theme_color": "#0284C7",
                "description": "Golden shores, swaying palms, and serene coastal retreats across India's coastline.",
                "order": 3
            },
            {
                "name": "Cultural heritage",
                "slug": "cultural-heritage",
                "icon": "Compass",
                "theme_color": "#5B3A8C",
                "description": "UNESCO World Heritage sites preserving the sculptural genius, philosophy, and vibrant traditions of ancient civilizations.",
                "order": 4
            },
            {
                "name": "Ecotourism and wildlife",
                "slug": "ecotourism-and-wildlife",
                "icon": "Trees",
                "theme_color": "#1F5C3F",
                "description": "Untamed national reserves, dense sal forests, and tiger habitats fostering biological biodiversity.",
                "order": 5
            },
            {
                "name": "Trekking",
                "slug": "trekking",
                "icon": "Mountain",
                "theme_color": "#475569",
                "description": "Rugged alpine trails, Himalayan ridge crossings, and high-altitude panoramic vistas.",
                "order": 6
            },
            {
                "name": "Water sports",
                "slug": "water-sports",
                "icon": "Waves",
                "theme_color": "#0EA5E9",
                "description": "Pristine coral reefs, turquoise lagoons, scuba diving, and thrilling marine expeditions.",
                "order": 7
            }
        ]

        category_objs = {}
        for cat in categories_data:
            obj, _ = Category.objects.update_or_create(slug=cat['slug'], defaults=cat)
            category_objs[cat['slug']] = obj

        self.stdout.write("Seeding states...")
        states_data = [
            {"name": "Odisha", "code": "OD"},
            {"name": "Uttar Pradesh", "code": "UP"},
            {"name": "Goa", "code": "GA"},
            {"name": "Karnataka", "code": "KA"},
            {"name": "Uttarakhand", "code": "UK"},
            {"name": "Himachal Pradesh", "code": "HP"},
            {"name": "Andaman and Nicobar Islands", "code": "AN"},
            {"name": "Tamil Nadu", "code": "TN"},
            {"name": "Delhi", "code": "DL"},
            {"name": "Kerala", "code": "KL"},
            {"name": "Maharashtra", "code": "MH"},
            {"name": "Madhya Pradesh", "code": "MP"},
            {"name": "Assam", "code": "AS"},
            {"name": "West Bengal", "code": "WB"},
        ]
        state_objs = {}
        for s in states_data:
            obj, _ = State.objects.update_or_create(code=s['code'], defaults=s)
            state_objs[s['code']] = obj

        self.stdout.write("Seeding places (3 per category)...")
        places_data = [
            # ==========================================
            # 1. TEMPLES AND SACRED SHRINES (3 Spots)
            # ==========================================
            {
                "slug": "konark-sun-temple",
                "name": "Konark Sun Temple",
                "category": category_objs["temples-and-sacred-shrines"],
                "state": state_objs["OD"],
                "short_description": "Conceived as a colossal stone chariot of Surya, the Sun God, the 13th-century Konark Sun Temple is a masterwork of Kalinga architecture. Featuring 24 intricately carved stone wheels acting as sundials and drawn by seven majestic horses, it stands as an enduring tribute to classical Odishan sculpture.",
                "short_description_ai": "Behold the grand Sun Temple of Konark, a 13th-century architectural marvel shaped like a magnificent chariot. Admire its 24 celestial wheels that tell solar time and explore its rich mythological friezes.",
                "history_notes": "Built around 1250 CE by King Narasimhadeva I of the Eastern Ganga Dynasty. Located in the coastal delta of Odisha. Declared a UNESCO World Heritage Site in 1984. European sailors referred to it as the Black Pagoda.",
                "latitude": 19.8876,
                "longitude": 86.0945,
                "best_season": "October to March",
                "scene_mode": "3d",
                "hero_image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Konarka_Temple.jpg/1280px-Konarka_Temple.jpg",
                "spawn_x": 0.0,
                "spawn_y": 1.2,
                "spawn_z": 12.0,
                "pois": [
                    {"title": "Chariot Sundial Wheels", "body": "24 carved stone astronomical sundials whose spokes cast shadows indicating the exact minute of solar time.", "pos_x": -6.0, "pos_y": 1.0, "pos_z": 2.0, "radius": 4.0},
                    {"title": "Natya Mandir (Hall of Dance)", "body": "An open pillar pavilion sculpted with 128 dynamic postures of classical Odissi dance and celestial musicians.", "pos_x": 0.0, "pos_y": 1.0, "pos_z": 0.0, "radius": 4.5},
                    {"title": "Sanctum Sanctorum (Jagamohana)", "body": "The monumental tiered pyramidal assembly hall reaching toward the heavens.", "pos_x": 6.5, "pos_y": 1.0, "pos_z": -5.0, "radius": 4.0}
                ]
            },
            {
                "slug": "meenakshi-amman-temple",
                "name": "Meenakshi Amman Temple",
                "category": category_objs["temples-and-sacred-shrines"],
                "state": state_objs["TN"],
                "short_description": "Located in the historic city of Madurai, Meenakshi Amman Temple is a glorious exemplar of Dravidian temple architecture. Renowned for its 14 towering multi-tiered gopurams encrusted with thousands of vibrantly painted mythological stucco figures and the Hall of Thousand Pillars.",
                "short_description_ai": "Enter the kaleidoscope of Dravidian artistry at Meenakshi Amman Temple in Madurai. Marvel at soaring gopurams populated by thousands of divine statues and wander through the musical pillared corridors.",
                "history_notes": "Originally built during the Pandyan era and comprehensively rebuilt by the Nayak rulers between 1560 and 1655 CE. The temple is dedicated to Meenakshi, a form of Goddess Parvati, and her consort Sundareswarar.",
                "latitude": 9.9195,
                "longitude": 78.1193,
                "best_season": "October to March",
                "scene_mode": "3d",
                "hero_image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/India_Meenakshi_Temple.jpg/1280px-India_Meenakshi_Temple.jpg",
                "spawn_x": 0.0,
                "spawn_y": 1.2,
                "spawn_z": 12.0,
                "pois": [
                    {"title": "Southern Gopuram", "body": "The tallest gateway tower standing at 52 metres, adorned with over 1,500 intricately sculpted and painted celestial figures.", "pos_x": 0.0, "pos_y": 1.0, "pos_z": 4.0, "radius": 4.0},
                    {"title": "Hall of a Thousand Pillars (Aayiram Kaal Mandapam)", "body": "Constructed in 1569 by Ariyanatha Mudaliar, featuring 985 carved stone pillars displaying Yalis, warriors, and musical acoustics.", "pos_x": -5.0, "pos_y": 1.0, "pos_z": -4.0, "radius": 4.5},
                    {"title": "Golden Lotus Tank (Potramarai Kulam)", "body": "The sacred temple reservoir where ancient Tamil Sangam poets submitted their manuscripts for divine review.", "pos_x": 5.0, "pos_y": 0.5, "pos_z": 0.0, "radius": 4.0}
                ]
            },
            {
                "slug": "kedarnath-temple",
                "name": "Kedarnath Temple",
                "category": category_objs["temples-and-sacred-shrines"],
                "state": state_objs["UK"],
                "short_description": "Perched at an altitude of 3,583 metres in the Garhwal Himalayas near the Mandakini River, Kedarnath is one of the twelve sacred Jyotirlingas of Lord Shiva. Built of massive grey granite slabs without mortar, it stands resilient against snowstorms and floods against towering glacial peaks.",
                "short_description_ai": "Witness the divine sanctuary of Kedarnath standing proud against the snowy amphitheatre of Mount Kedarnath. Experience the peaceful chants echoing across the high Himalayan valley.",
                "history_notes": "Believed by tradition to have been founded by the Pandavas and revived in the 8th century CE by Adi Shankaracharya. The grey stone temple endured centuries under ice and snow.",
                "latitude": 30.7352,
                "longitude": 79.0669,
                "best_season": "May to June, September to October",
                "scene_mode": "3d",
                "hero_image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Kedarnath_Temple_in_Rainy_season.jpg/1280px-Kedarnath_Temple_in_Rainy_season.jpg",
                "spawn_x": 0.0,
                "spawn_y": 1.5,
                "spawn_z": 14.0,
                "pois": [
                    {"title": "Garbhagriha (Sanctum)", "body": "Houses the triangular natural rock Shiva lingam worshipped for millennia by ascetics and pilgrims.", "pos_x": 0.0, "pos_y": 1.0, "pos_z": -5.0, "radius": 4.0},
                    {"title": "Nandi Bull Guardian", "body": "A colossal seated stone Nandi bull facing the shrine entrance with reverent gaze.", "pos_x": 0.0, "pos_y": 0.8, "pos_z": 3.0, "radius": 3.5},
                    {"title": "Bhairavnath Ridge", "body": "Vantage ridge dedicated to Bhairava, offering sweeping panoramas of the Kedarnath glacial cirque.", "pos_x": -7.0, "pos_y": 2.0, "pos_z": 0.0, "radius": 4.5}
                ]
            },

            # ==========================================
            # 2. MONUMENTS (3 Spots)
            # ==========================================
            {
                "slug": "taj-mahal",
                "name": "Taj Mahal",
                "category": category_objs["monuments"],
                "state": state_objs["UP"],
                "short_description": "An ivory-white marble mausoleum on the south bank of the Yamuna River in Agra. Commissioned in 1632 by Mughal emperor Shah Jahan for his empress Mumtaz Mahal, it represents the sublime culmination of Mughal architecture with immaculate geometric symmetry.",
                "short_description_ai": "Marvel at the pure white marble splendour of the Taj Mahal. Stroll through the lush Charbagh gardens, gaze upon the reflecting pool, and witness how the dome reflects subtle hues of dawn and twilight.",
                "history_notes": "Construction took over 20 years involving 20,000 artisans. Designated a UNESCO World Heritage Site in 1983. Features delicate pietra dura gemstone inlay work.",
                "latitude": 27.1751,
                "longitude": 78.0421,
                "best_season": "October to March",
                "scene_mode": "3d",
                "hero_image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/1280px-Taj_Mahal_%28Edited%29.jpeg",
                "spawn_x": 0.0,
                "spawn_y": 1.2,
                "spawn_z": 15.0,
                "pois": [
                    {"title": "The Grand Marble Dome", "body": "The iconic central dome rising 73 metres, crowned with a lotus motif and surrounded by four minarets.", "pos_x": 0.0, "pos_y": 1.0, "pos_z": -4.0, "radius": 5.0},
                    {"title": "Charbagh Reflecting Pool", "body": "The Persian paradise quadrangle waterways reflecting the ivory facade.", "pos_x": 0.0, "pos_y": 0.5, "pos_z": 6.0, "radius": 4.0},
                    {"title": "Pietra Dura Inlay Screen", "body": "Perforated marble jali screens inlaid with semi-precious lapis lazuli and jade.", "pos_x": -4.0, "pos_y": 1.0, "pos_z": -2.0, "radius": 3.5}
                ]
            },
            {
                "slug": "red-fort-delhi",
                "name": "Red Fort (Lal Qila)",
                "category": category_objs["monuments"],
                "state": state_objs["DL"],
                "short_description": "The historic citadel of Shahjahanabad built from glowing red sandstone along the Yamuna River. Serving as the primary residence of Mughal emperors for nearly two centuries, its grand ramparts, ornate marble pavilions, and royal courtyards stand as an enduring symbol of Indian sovereignty.",
                "short_description_ai": "Explore the majestic Red Fort of Delhi. Walk through the Lahori Gate, admire the delicate Diwan-i-Khas marble columns, and feel the weight of centuries of imperial ceremonies.",
                "history_notes": "Commissioned by Emperor Shah Jahan in 1638 when he shifted his capital from Agra to Delhi. Architect Ustad Ahmad Lahori designed the palace complex. Designated a UNESCO World Heritage Site in 2007.",
                "latitude": 28.6562,
                "longitude": 77.2410,
                "best_season": "October to March",
                "scene_mode": "3d",
                "hero_image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Delhi_fort.jpg/1280px-Delhi_fort.jpg",
                "spawn_x": 0.0,
                "spawn_y": 1.2,
                "spawn_z": 12.0,
                "pois": [
                    {"title": "Lahori Gate & Ramparts", "body": "The grand ceremonial entrance where the National Flag is hoisted each Independence Day by the Prime Minister.", "pos_x": 0.0, "pos_y": 1.0, "pos_z": 6.0, "radius": 4.5},
                    {"title": "Diwan-i-Khas (Hall of Private Audiences)", "body": "A white marble pavilion inscribed with the famous Persian couplet: 'If there be a paradise on earth, it is this, it is this, it is this.'", "pos_x": -5.0, "pos_y": 1.0, "pos_z": -3.0, "radius": 4.0},
                    {"title": "Nahr-i-Bihisht (Canal of Paradise)", "body": "The water channels that linked the royal apartments, cooled by waters channeled from the Yamuna.", "pos_x": 5.0, "pos_y": 0.5, "pos_z": -1.0, "radius": 4.0}
                ]
            },
            {
                "slug": "qutub-minar",
                "name": "Qutub Minar",
                "category": category_objs["monuments"],
                "state": state_objs["DL"],
                "short_description": "Soaring 72.5 metres into the sky, Qutub Minar is the world's tallest brick minaret. Constructed of fluted red sandstone and pale marble with alternating angular and rounded projections, it is surrounded by ancient monuments including the rust-resistant 4th-century Iron Pillar.",
                "short_description_ai": "Gaze upward at the soaring tiers of the Qutub Minar. Discover calligraphic Arabic inscriptions, delicately projecting balconies, and the miraculous metallurgic enigma of the Iron Pillar.",
                "history_notes": "Initiated in 1192 CE by Qutb-ud-din Aibak of the Delhi Sultanate and completed by Shams-ud-din Iltutmish. Declared a UNESCO World Heritage Site in 1993.",
                "latitude": 28.5245,
                "longitude": 77.1855,
                "best_season": "October to March",
                "scene_mode": "3d",
                "hero_image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Qutb_Minar_2022.jpg/1280px-Qutb_Minar_2022.jpg",
                "spawn_x": 0.0,
                "spawn_y": 1.2,
                "spawn_z": 12.0,
                "pois": [
                    {"title": "The Fluted Tower", "body": "Five distinct tapering storeys decorated with intricate Qur'anic calligraphy and corbelled stalactite balconies.", "pos_x": 0.0, "pos_y": 1.0, "pos_z": -4.0, "radius": 4.5},
                    {"title": "Gupta Iron Pillar", "body": "A 7.2-metre metallurgical marvel cast during the reign of Chandragupta II, remaining rust-free for over 1,600 years.", "pos_x": -4.0, "pos_y": 0.8, "pos_z": 2.0, "radius": 3.5},
                    {"title": "Alai Darwaza Gate", "body": "The southern gateway built by Alauddin Khalji in 1311 CE, showcasing the earliest true arches with red sandstone fretwork.", "pos_x": 5.0, "pos_y": 1.0, "pos_z": 0.0, "radius": 4.0}
                ]
            },

            # ==========================================
            # 3. BEACH RESORTS (3 Spots)
            # ==========================================
            {
                "slug": "palolem-beach",
                "name": "Palolem Beach",
                "category": category_objs["beach-resorts"],
                "state": state_objs["GA"],
                "short_description": "Nestled in South Goa, Palolem Beach is renowned for its tranquil crescent-shaped white sand bay framed by dense coconut palm groves. Gently sheltered from the Arabian Sea, it offers calming waters, colourful beach shacks, and mesmerizing sunset horizons with leaping dolphin pods.",
                "short_description_ai": "Sink into relaxation at Palolem Beach, Goa's serene southern crescent. Walk along warm golden sands, listen to the rhythmic waves of the Arabian Sea, and discover quaint coastal huts beneath swaying palms.",
                "history_notes": "Originally a quiet fishing hamlet in Canacona, South Goa. Developed a bohemian identity in the 1980s while strictly retaining environmental zoning against concrete high-rises. Famed for eco-friendly wooden beach cottages rebuilt each season.",
                "latitude": 15.0100,
                "longitude": 74.0232,
                "best_season": "November to February",
                "scene_mode": "3d",
                "hero_image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Palolem_Beach%2C_South_Goa.jpg/1280px-Palolem_Beach%2C_South_Goa.jpg",
                "spawn_x": 0.0,
                "spawn_y": 1.0,
                "spawn_z": 10.0,
                "pois": [
                    {"title": "Crescent Shoreline & Shacks", "body": "A pristine two-kilometre arc of fine sand shaded by towering coconut palms, lined with sustainable eco-huts serving fresh local coastal cuisine.", "pos_x": -3.0, "pos_y": 0.5, "pos_z": 2.0, "radius": 4.0},
                    {"title": "Monkey Island & Headland", "body": "A forested rocky islet at the northern edge accessible on foot at low tide, providing vantage vistas over the tranquil bay and dolphin feeding waters.", "pos_x": 6.0, "pos_y": 1.5, "pos_z": -6.0, "radius": 4.5}
                ]
            },
            {
                "slug": "varkala-cliff-beach",
                "name": "Varkala Cliff Beach (Papanasam)",
                "category": category_objs["beach-resorts"],
                "state": state_objs["KL"],
                "short_description": "Perched dramatically along red laterite sedimentary cliffs in southern Kerala, Varkala is unique for its cliff-side promenade looking over the Arabian Sea. Known as Papanasam Beach ('cleanser of sins'), natural mineral springs bubble along the cliff base beside pristine golden sands.",
                "short_description_ai": "Walk along the high red cliffs of Varkala overlooking the turquoise Arabian Sea. Sip coconut water at bohemian cliff-side cafes and breathe in the therapeutic ocean breeze of Kerala.",
                "history_notes": "Recognized as a geological monument by the Geological Survey of India. The nearby Janardhana Swamy Temple is over 2,000 years old, drawing spiritual pilgrims alongside global travelers.",
                "latitude": 8.7379,
                "longitude": 76.7027,
                "best_season": "October to March",
                "scene_mode": "3d",
                "hero_image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Varkala_beach_from_above.jpg/1280px-Varkala_beach_from_above.jpg",
                "spawn_x": 0.0,
                "spawn_y": 1.2,
                "spawn_z": 12.0,
                "pois": [
                    {"title": "Red Laterite North Cliff", "body": "Towering vertical red sandstone cliffs with a paved footpath lined with artisan cafes, yoga retreats, and sunset viewpoints.", "pos_x": -4.0, "pos_y": 2.0, "pos_z": 3.0, "radius": 4.5},
                    {"title": "Papanasam Sacred Springs", "body": "Natural holy mineral springs emerging from the cliff face, believed to possess therapeutic purifying properties.", "pos_x": 4.0, "pos_y": 0.5, "pos_z": -3.0, "radius": 4.0}
                ]
            },
            {
                "slug": "marina-beach-chennai",
                "name": "Marina Beach",
                "category": category_objs["beach-resorts"],
                "state": state_objs["TN"],
                "short_description": "Stretching for 13 kilometres along the Bay of Bengal in Chennai, Marina Beach is India's longest natural urban beach. Renowned for its wide sandy expanse, cooling evening sea breezes, historical colonial statues, and lively food carts serving sundal and roasted corn.",
                "short_description_ai": "Feel the vastness of the Bay of Bengal at Marina Beach. Watch colourful fishing catamarans, stroll past historic lighthouses, and experience the lively coastal spirit of Chennai.",
                "history_notes": "Redeveloped in the 1880s by Mountstuart Elphinstone Grant Duff, the Governor of Madras, who was captivated by the sandy shoreline and promenade.",
                "latitude": 13.0499,
                "longitude": 80.2824,
                "best_season": "November to February",
                "scene_mode": "3d",
                "hero_image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Chennai_Marina_beach_panorama1.jpg/1280px-Chennai_Marina_beach_panorama1.jpg",
                "spawn_x": 0.0,
                "spawn_y": 1.0,
                "spawn_z": 12.0,
                "pois": [
                    {"title": "Marina Lighthouse Viewpoint", "body": "A 46-metre high functioning lighthouse offering bird's-eye panoramas of the Coromandel coastline.", "pos_x": -5.0, "pos_y": 1.5, "pos_z": -2.0, "radius": 4.0},
                    {"title": "Catamaran Fishing Haven", "body": "Traditional wooden catamarans launched daily by coastal fishermen through the breaking surf.", "pos_x": 4.0, "pos_y": 0.5, "pos_z": 4.0, "radius": 4.0}
                ]
            },

            # ==========================================
            # 4. CULTURAL HERITAGE (3 Spots)
            # ==========================================
            {
                "slug": "hampi",
                "name": "Hampi",
                "category": category_objs["cultural-heritage"],
                "state": state_objs["KA"],
                "short_description": "The capital of the historic Vijayanagara Empire from 1336 to 1565 CE, Hampi is an extraordinary open-air museum spread across 4,100 hectares of boulder-strewn hills along the Tungabhadra River. Its monolithic stone chariot, musical pillars, and royal pavilions evoke one of medieval India's wealthiest metropolises.",
                "short_description_ai": "Step into the enchanted boulder kingdom of Hampi. Explore the iconic Vijaya Vittala temple, strike the musical stone pillars, and gaze across river valleys where ancient emperors once traded gems and silk.",
                "history_notes": "Mentioned in the Ramayana as Kishkindha. Ruled by Emperor Krishnadevaraya in the early 16th century. Sacked in 1565 after the Battle of Talikota. Designated a UNESCO World Heritage Site in 1986.",
                "latitude": 15.3350,
                "longitude": 76.4600,
                "best_season": "October to February",
                "scene_mode": "3d",
                "hero_image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Stone_Chariot%2C_Hampi.jpg/1280px-Stone_Chariot%2C_Hampi.jpg",
                "spawn_x": 0.0,
                "spawn_y": 1.2,
                "spawn_z": 12.0,
                "pois": [
                    {"title": "Vittala Stone Chariot", "body": "An iconic monolithic shrine dedicated to Garuda, sculpted from chlorite schist blocks so seamlessly joined that it appears carved from a single massive rock.", "pos_x": 0.0, "pos_y": 1.0, "pos_z": 0.0, "radius": 4.0},
                    {"title": "Sangeetha Mandapa (Musical Pillars)", "body": "Fifty-six granite pillars that produce bell-like resonant notes of Indian musical instruments when tapped gently.", "pos_x": -5.0, "pos_y": 1.0, "pos_z": -4.0, "radius": 3.5},
                    {"title": "Hemakuta Boulder Ridge", "body": "A panoramic granite hillside overlooking Virupaksha Temple, dotted with pre-Vijayanagara shrines and sacred pools.", "pos_x": 7.0, "pos_y": 2.0, "pos_z": 5.0, "radius": 4.0}
                ]
            },
            {
                "slug": "ajanta-and-ellora-caves",
                "name": "Ajanta & Ellora Caves",
                "category": category_objs["cultural-heritage"],
                "state": state_objs["MH"],
                "short_description": "Carved into the volcanic basalt cliff face of the Sahyadri hills, Ajanta and Ellora feature the finest surviving masterpieces of ancient Indian rock-cut architecture. Ranging from 2nd century BCE Buddhist cave frescoes to the astonishing monolithic Kailash Temple, carved top-down from a single mountain.",
                "short_description_ai": "Descend into the rock-hewn wonders of Ajanta and Ellora. Gaze upon 2,000-year-old painted murals of the Buddha and stand humbled before the monolithic Kailash Temple carved from living rock.",
                "history_notes": "Ajanta features 30 rock-cut Buddhist caves rediscovered in 1819 by John Smith. Ellora contains 34 monumental caves representing Buddhism, Hinduism, and Jainism. Declared UNESCO World Heritage Sites in 1983.",
                "latitude": 20.5519,
                "longitude": 75.7033,
                "best_season": "October to March",
                "scene_mode": "3d",
                "hero_image_url": "https://upload.wikimedia.org/wikipedia/commons/1/15/Ellora_cave16_001.jpg",
                "spawn_x": 0.0,
                "spawn_y": 1.2,
                "spawn_z": 12.0,
                "pois": [
                    {"title": "Kailash Temple (Cave 16)", "body": "The largest monolithic rock-cut structure on Earth, carved top-down from a single cliff removing 200,000 tonnes of basalt.", "pos_x": 0.0, "pos_y": 1.0, "pos_z": -4.0, "radius": 4.5},
                    {"title": "Padmapani Fresco Mural (Cave 1)", "body": "The world-famous classical fresco depicting Bodhisattva Padmapani holding a blue lotus with compassionate poise.", "pos_x": -5.0, "pos_y": 1.0, "pos_z": 2.0, "radius": 3.5},
                    {"title": "Chaitya Worship Hall (Cave 26)", "body": "A horse-shoe shaped vaulted hall with a 7-metre reclining Buddha capturing his final Mahaparinirvana.", "pos_x": 5.0, "pos_y": 1.0, "pos_z": 1.0, "radius": 4.0}
                ]
            },
            {
                "slug": "khajuraho-monuments",
                "name": "Khajuraho Group of Monuments",
                "category": category_objs["cultural-heritage"],
                "state": state_objs["MP"],
                "short_description": "Built between 950 and 1050 CE by the Chandela dynasty, Khajuraho is renowned for its Nagara-style sandstone temples. Celebrated for exquisite carvings that celebrate life, divine dance, celestial nymphs, and spiritual union, rising like mountain peaks across lush gardens.",
                "short_description_ai": "Explore the stone symphonies of Khajuraho. Admire the soaring shikhara of Kandariya Mahadeva Temple, adorned with thousands of dynamic sculptural friezes celebrating beauty and cosmic balance.",
                "history_notes": "Originally comprised 85 temples, of which 25 survive in excellent preservation. Declared a UNESCO World Heritage Site in 1986. Constructed of fine-grained sandstone with precise mortise-and-tenon joints.",
                "latitude": 24.8318,
                "longitude": 79.9199,
                "best_season": "October to March",
                "scene_mode": "3d",
                "hero_image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/1_Khajuraho.jpg/1280px-1_Khajuraho.jpg",
                "spawn_x": 0.0,
                "spawn_y": 1.2,
                "spawn_z": 12.0,
                "pois": [
                    {"title": "Kandariya Mahadeva Shikhara", "body": "Rising 31 metres, its tiered mountain-like spires resemble Mount Kailash, decorated with 872 sculpted statues.", "pos_x": 0.0, "pos_y": 1.0, "pos_z": -5.0, "radius": 4.5},
                    {"title": "Lakshmana Temple Reliefs", "body": "Features intricate sandstone friezes depicting musicians, royal hunts, mythological battles, and celestial apsaras.", "pos_x": -4.0, "pos_y": 1.0, "pos_z": 2.0, "radius": 4.0}
                ]
            },

            # ==========================================
            # 5. ECOTOURISM AND WILDLIFE (3 Spots)
            # ==========================================
            {
                "slug": "jim-corbett",
                "name": "Jim Corbett National Park",
                "category": category_objs["ecotourism-and-wildlife"],
                "state": state_objs["UK"],
                "short_description": "Established in 1936 as Hailey National Park, Jim Corbett is India's oldest national park and the birthplace of Project Tiger. Spanning the forested foothills of the Himalayas along the Ramganga River, its dense sal woodlands, grasslands, and riverine belts shelter wild Bengal tigers, Asiatic elephants, and over 600 bird species.",
                "short_description_ai": "Enter the untamed wilderness of Jim Corbett National Park. Journey along the misty Ramganga riverbank, cross dense sal canopies, and discover the legendary sanctuary of the Royal Bengal Tiger.",
                "history_notes": "Named in honour of naturalist and conservationist Jim Corbett. Located in Uttarakhand. First protected reserve chosen for Project Tiger launch in 1973.",
                "latitude": 29.5300,
                "longitude": 78.7747,
                "best_season": "November to June",
                "scene_mode": "3d",
                "hero_image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Bengal-Tiger_Corbett_Uttarakhand_Dec-2013.jpg/1280px-Bengal-Tiger_Corbett_Uttarakhand_Dec-2013.jpg",
                "spawn_x": 0.0,
                "spawn_y": 1.2,
                "spawn_z": 12.0,
                "pois": [
                    {"title": "Dhikala Forest Chaur", "body": "An expansive grassland chaur bordered by the Shivalik hills where wild elephants graze alongside spotted deer and tiger patrols.", "pos_x": -4.0, "pos_y": 1.0, "pos_z": 2.0, "radius": 4.5},
                    {"title": "Ramganga River Crossing", "body": "Pristine mountain river waters where endangered fish-eating Gharials bask on sandy banks amidst migratory raptors.", "pos_x": 5.0, "pos_y": 0.5, "pos_z": -5.0, "radius": 4.0}
                ]
            },
            {
                "slug": "kaziranga-national-park",
                "name": "Kaziranga National Park",
                "category": category_objs["ecotourism-and-wildlife"],
                "state": state_objs["AS"],
                "short_description": "Nestled in the floodplains of the mighty Brahmaputra River in Assam, Kaziranga is home to the world's largest population of the great Indian one-horned rhinoceros. Its fertile elephant grass wetlands and semi-evergreen forests harbor tigers, wild water buffaloes, and river dolphins.",
                "short_description_ai": "Embark on an expedition across the misty grasslands of Kaziranga. Gaze upon armoured one-horned rhinos grazing peacefully alongside herds of wild Asian elephants.",
                "history_notes": "Established in 1905 when Mary Curzon persuaded her husband Lord Curzon to protect the vanishing rhinos. Inscribed as a UNESCO World Heritage Site in 1985.",
                "latitude": 26.5775,
                "longitude": 93.1711,
                "best_season": "November to April",
                "scene_mode": "3d",
                "hero_image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Beauty_of_Kaziranga_National_Park.jpg/1280px-Beauty_of_Kaziranga_National_Park.jpg",
                "spawn_x": 0.0,
                "spawn_y": 1.2,
                "spawn_z": 12.0,
                "pois": [
                    {"title": "Central Kohora Rhino Basin", "body": "Vast marshlands where one-horned rhinos wade alongside swamp deer and pelicans.", "pos_x": -3.0, "pos_y": 1.0, "pos_z": 0.0, "radius": 4.5},
                    {"title": "Brahmaputra Floodplain Watchtower", "body": "Elevated wooden observatory overlooking ancient water channels and elephant trails.", "pos_x": 4.0, "pos_y": 1.5, "pos_z": -4.0, "radius": 4.0}
                ]
            },
            {
                "slug": "sundarbans-mangrove-forest",
                "name": "Sundarbans National Park",
                "category": category_objs["ecotourism-and-wildlife"],
                "state": state_objs["WB"],
                "short_description": "The largest contiguous mangrove delta on the planet, formed by the confluence of the Ganges, Brahmaputra, and Meghna rivers in the Bay of Bengal. Famous for its Sundari trees, tidal waterways, saltwater crocodiles, and swimming Royal Bengal tigers adapted to amphibious jungle life.",
                "short_description_ai": "Navigate the mysterious tidal channels of the Sundarbans. Glide past dense mangrove roots and discover the untamed realm where the Royal Bengal tiger swims across brackish rivers.",
                "history_notes": "A UNESCO World Heritage Site and Ramsar wetland of international importance. Encompasses over 10,000 square kilometres of tidal waterways and mangrove islands.",
                "latitude": 21.9497,
                "longitude": 89.1833,
                "best_season": "September to March",
                "scene_mode": "3d",
                "hero_image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Sundarban_Tiger.jpg/1280px-Sundarban_Tiger.jpg",
                "spawn_x": 0.0,
                "spawn_y": 1.0,
                "spawn_z": 12.0,
                "pois": [
                    {"title": "Sajnekhali Mangrove Watchtower", "body": "A secure wooden canopy watchtower looking over wildlife watering holes and river turtle breeding stations.", "pos_x": -3.0, "pos_y": 1.5, "pos_z": 1.0, "radius": 4.0},
                    {"title": "Piyali Tidal Creek", "body": "An interconnected saltwater labyrinth where spotted deer feed alongside mudskippers and fishing cats.", "pos_x": 4.0, "pos_y": 0.5, "pos_z": -3.0, "radius": 4.5}
                ]
            },

            # ==========================================
            # 6. TREKKING (3 Spots)
            # ==========================================
            {
                "slug": "triund-trek",
                "name": "Triund Trek",
                "category": category_objs["trekking"],
                "state": state_objs["HP"],
                "short_description": "Perched at 2,828 metres on the crest of the Dhauladhar range above McLeod Ganj, Triund is a classic Himalayan trek. The trail winds through whispering forests of oak, deodar, and vibrant rhododendron, culminating in a dramatic ridge that offers 360-degree views of snow-crowned alpine peaks and the sprawling Kangra Valley.",
                "short_description_ai": "Climb through fragrant pine forests to the high grassy ridge of Triund. Gaze in awe at the sheer granite walls of the snow-clad Dhauladhar mountains rising immediately before your eyes.",
                "history_notes": "An ancient shepherd trail used by the Gaddi nomads to move flocks between Kangra Valley and Chamba. Situated in Dharamshala, close to the residence of His Holiness the Dalai Lama.",
                "latitude": 32.2530,
                "longitude": 76.3530,
                "best_season": "March to June, September to December",
                "scene_mode": "3d",
                "hero_image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Triund_%2822356802630%29.jpg/1280px-Triund_%2822356802630%29.jpg",
                "spawn_x": 0.0,
                "spawn_y": 1.5,
                "spawn_z": 14.0,
                "pois": [
                    {"title": "Triund Top Ridge Meadow", "body": "A sweeping grassy shelf at 2,828m where the colossal snow-covered wall of Mun Peak seems almost within arm's reach.", "pos_x": 0.0, "pos_y": 2.0, "pos_z": 0.0, "radius": 5.0},
                    {"title": "Magic View Cafe & Pine Forest", "body": "One of Himachal's oldest trekking halts, offering refreshing Himalayan mountain tea looking downward across the emerald Kangra plains.", "pos_x": -6.0, "pos_y": 1.0, "pos_z": 6.0, "radius": 4.0}
                ]
            },
            {
                "slug": "valley-of-flowers",
                "name": "Valley of Flowers Trek",
                "category": category_objs["trekking"],
                "state": state_objs["UK"],
                "short_description": "Nestled in the high-altitude Zanskar and Great Himalayan transition zone at 3,600 metres, the Valley of Flowers is a vibrant natural alpine meadow. Carpeted with over 500 species of wild flowering blossoms including the mythical Brahma Kamal, blue poppies, and cobra lilies amidst glacial torrents.",
                "short_description_ai": "Trek into a fairytale botanical kingdom at the Valley of Flowers. Walk through knee-deep meadows of wild Himalayan blossoms framed by snow-clad peaks and misty cascading waterfalls.",
                "history_notes": "Discovered by British mountaineer Frank Smythe in 1931 when returning from Mount Kamet. Declared a UNESCO World Heritage Site in 2005.",
                "latitude": 30.7280,
                "longitude": 79.6053,
                "best_season": "July to September",
                "scene_mode": "3d",
                "hero_image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Valley_of_flowers_national_park%2C_Uttarakhand%2C_India_03_%28edit%29.jpg/1280px-Valley_of_flowers_national_park%2C_Uttarakhand%2C_India_03_%28edit%29.jpg",
                "spawn_x": 0.0,
                "spawn_y": 1.5,
                "spawn_z": 14.0,
                "pois": [
                    {"title": "Pushpawati River Banks", "body": "Melting glacial mountain stream flowing through carpets of rare blue poppies and yellow anemones.", "pos_x": -4.0, "pos_y": 1.0, "pos_z": 2.0, "radius": 4.5},
                    {"title": "Joan Margaret Legge Memorial", "body": "A stone memorial erected in honor of the Kew Gardens botanist who studied the valley's flora in 1939.", "pos_x": 5.0, "pos_y": 1.2, "pos_z": -3.0, "radius": 4.0}
                ]
            },
            {
                "slug": "kudremukh-peak-trek",
                "name": "Kudremukh Peak Trek",
                "category": category_objs["trekking"],
                "state": state_objs["KA"],
                "short_description": "Rising 1,894 metres in the Western Ghats biodiversity hotspot in Chikkamagaluru, Kudremukh gets its name from its distinctive horse-faced mountain profile. The trail ascends through rolling emerald shola grasslands, cloud forests, and gushing freshwater mountain streams.",
                "short_description_ai": "Hike the rolling green ridges of Kudremukh in the heart of Karnataka's Western Ghats. Breathe in the crisp mountain air as clouds roll across endless emerald grassland peaks.",
                "history_notes": "Located in Kudremukh National Park, declared a Tiger Reserve in 2011. Strict ecotourism regulations protect its pristine shola-grassland ecosystem.",
                "latitude": 13.2189,
                "longitude": 75.2530,
                "best_season": "October to February",
                "scene_mode": "3d",
                "hero_image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Kudremukh_national_park.jpg/1280px-Kudremukh_national_park.jpg",
                "spawn_x": 0.0,
                "spawn_y": 1.4,
                "spawn_z": 12.0,
                "pois": [
                    {"title": "Horse-Face Peak Ridge", "body": "The iconic rocky summit profile resembling a galloping stallion overlooking ocean-like sea of clouds.", "pos_x": 0.0, "pos_y": 2.0, "pos_z": -4.0, "radius": 4.5},
                    {"title": "Shola Forest Stream Crossing", "body": "A crystal-clear forest brook flowing beneath dense canopy where endemic Malabar whistling thrushes sing.", "pos_x": -5.0, "pos_y": 0.8, "pos_z": 3.0, "radius": 4.0}
                ]
            },

            # ==========================================
            # 7. WATER SPORTS (3 Spots)
            # ==========================================
            {
                "slug": "havelock-island",
                "name": "Havelock Island (Swaraj Dweep)",
                "category": category_objs["water-sports"],
                "state": state_objs["AN"],
                "short_description": "Known as Swaraj Dweep, Havelock Island is the crown jewel of the Andaman archipelago. Famed for Radhanagar Beach and Elephant Beach, it boasts bioluminescent waters, thriving coral ecosystems, and world-class scuba diving through submerged shipwrecks and manta ray channels.",
                "short_description_ai": "Dive into the crystalline turquoise seas of Havelock Island. Float above living coral reefs, stroll the silky sands of Radhanagar Beach, and immerse yourself in tropical marine wonders.",
                "history_notes": "Renamed Swaraj Dweep in 2018 in honour of Netaji Subhas Chandra Bose. Surrounded by the Ritchie's Archipelago in the Bay of Bengal, protected by strict coastal regulation zones.",
                "latitude": 11.9761,
                "longitude": 92.9876,
                "best_season": "October to May",
                "scene_mode": "3d",
                "hero_image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Havelock%2C_Andaman_%26_Nicobar_Islands.JPG/1280px-Havelock%2C_Andaman_%26_Nicobar_Islands.JPG",
                "spawn_x": 0.0,
                "spawn_y": 1.0,
                "spawn_z": 12.0,
                "pois": [
                    {"title": "Elephant Beach Coral Reef", "body": "A vibrant shallow reef populated by clownfish, sea turtles, and staghorn corals, ideal for snorkelling and sea walking.", "pos_x": -4.0, "pos_y": 0.5, "pos_z": -2.0, "radius": 4.0},
                    {"title": "Radhanagar Silky Sands", "body": "A wide, blindingly white beach kissed by translucent turquoise waters, backed by a lush canopy of ancient padauk and mahua trees.", "pos_x": 4.0, "pos_y": 0.5, "pos_z": 4.0, "radius": 4.5}
                ]
            },
            {
                "slug": "rishikesh-white-water-rafting",
                "name": "Rishikesh White Water Rapids",
                "category": category_objs["water-sports"],
                "state": state_objs["UK"],
                "short_description": "Known as the Adventure Capital of India, Rishikesh offers exhilarating white water rafting along the turbulent emerald waters of the Ganga as it bursts through Himalayan gorges. Featuring Class III and IV rapids such as 'The Wall', 'Roller Coaster', and 'Golf Course'.",
                "short_description_ai": "Feel the rush of adrenaline rafting down the glacial currents of the holy Ganga in Rishikesh. Conquer roaring rapids flanked by steep Himalayan cliffs and pristine riverside sandy beaches.",
                "history_notes": "Nestled in the Shivalik foothills of the Himalayas. Alongside river sports, Rishikesh is revered globally as the Yoga Capital of the World.",
                "latitude": 30.0869,
                "longitude": 78.2676,
                "best_season": "September to June",
                "scene_mode": "3d",
                "hero_image_url": "https://upload.wikimedia.org/wikipedia/commons/1/15/Rafting_in_the_Ganga%2C_Rishikesh.jpg",
                "spawn_x": 0.0,
                "spawn_y": 1.2,
                "spawn_z": 12.0,
                "pois": [
                    {"title": "Roller Coaster Rapid", "body": "A thrilling Grade III+ rapid with foaming drop waves that surge through narrow limestone canyons.", "pos_x": -3.0, "pos_y": 0.5, "pos_z": 1.0, "radius": 4.0},
                    {"title": "Shivpuri Sandy Launch Beach", "body": "A pristine silver sand riverbank where rafts launch beneath towering Himalayan deodar ridges.", "pos_x": 4.0, "pos_y": 0.8, "pos_z": -3.0, "radius": 4.5}
                ]
            },
            {
                "slug": "netrani-island-scuba",
                "name": "Netrani Island Coral Dives",
                "category": category_objs["water-sports"],
                "state": state_objs["KA"],
                "short_description": "Also known as Pigeon Island, Netrani is a heart-shaped coral island off the coast of Murudeshwar in the Arabian Sea. It is mainland India's premier scuba diving and snorkelling sanctuary, boasting crystal clear underwater visibility and encounters with whale sharks, manta rays, and barracudas.",
                "short_description_ai": "Submerge into an undersea wonderland at Netrani Island. Swim through vibrant coral gardens teeming with reef fish, graceful sea turtles, and soaring stingrays in the warm Arabian Sea.",
                "history_notes": "An uninhabited coral island 19 km off the coast of Karnataka. Renowned for underwater visibility reaching up to 30 metres during calm post-monsoon months.",
                "latitude": 14.0167,
                "longitude": 74.3333,
                "best_season": "October to May",
                "scene_mode": "3d",
                "hero_image_url": "https://upload.wikimedia.org/wikipedia/commons/f/ff/Netrani_Island_Arial_View.jpg",
                "spawn_x": 0.0,
                "spawn_y": 1.0,
                "spawn_z": 12.0,
                "pois": [
                    {"title": "The Grand Pinnacle Reef", "body": "A submerged vertical rock pinnacle carpeted in soft corals, anemones, and schools of yellowfin barracudas.", "pos_x": -4.0, "pos_y": 0.5, "pos_z": -2.0, "radius": 4.5},
                    {"title": "Turtle Point Bay", "body": "A calm sheltered cove where green sea turtles and honeycomb moray eels glide through coral crevices.", "pos_x": 4.0, "pos_y": 0.5, "pos_z": 3.0, "radius": 4.0}
                ]
            }
        ]

        for p_data in places_data:
            pois = p_data.pop('pois')
            hero = p_data.get('hero_image_url')
            place, created = Place.objects.update_or_create(slug=p_data['slug'], defaults=p_data)
            
            # Seed POIs
            for idx, poi_data in enumerate(pois):
                POI.objects.update_or_create(
                    place=place,
                    title=poi_data['title'],
                    defaults={
                        'body': poi_data['body'],
                        'pos_x': poi_data['pos_x'],
                        'pos_y': poi_data['pos_y'],
                        'pos_z': poi_data['pos_z'],
                        'radius': poi_data['radius'],
                        'order': idx + 1
                    }
                )

            # Seed Media Item
            if hero:
                Media.objects.update_or_create(
                    place=place,
                    order=1,
                    defaults={'image_url': hero, 'caption': f"Panoramic view of {place.name}"}
                )

        # Ensure demo user exists for seamless evaluation and login
        from django.contrib.auth import get_user_model
        User = get_user_model()
        demo_email = 'admin@bharatdarshan.com'
        demo_user = User.objects.filter(email=demo_email).first()
        if not demo_user:
            demo_user = User.objects.create_superuser(
                email=demo_email,
                username='admin',
                password='Admin@12345',
                display_name='Bharat Admin'
            )
            self.stdout.write(self.style.SUCCESS(f"Demo superuser created: {demo_email}"))
        else:
            demo_user.set_password('Admin@12345')
            demo_user.is_superuser = True
            demo_user.is_staff = True
            demo_user.save()
            self.stdout.write(self.style.SUCCESS(f"Demo superuser updated: {demo_email}"))

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {len(places_data)} places (at least 3 spots per category across 7 categories)!"))
