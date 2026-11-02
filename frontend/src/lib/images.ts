import React from 'react';

export const PLACE_SPECIFIC_IMAGES: Record<string, string> = {
  // Temples & Sacred Shrines
  'konark-sun-temple': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Konarka_Temple.jpg/1280px-Konarka_Temple.jpg',
  'meenakshi-amman-temple': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/India_Meenakshi_Temple.jpg/1280px-India_Meenakshi_Temple.jpg',
  'kedarnath-temple': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Kedarnath_Temple_in_Rainy_season.jpg/1280px-Kedarnath_Temple_in_Rainy_season.jpg',

  // Monuments
  'taj-mahal': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/1280px-Taj_Mahal_%28Edited%29.jpeg',
  'red-fort-delhi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Delhi_fort.jpg/1280px-Delhi_fort.jpg',
  'qutub-minar': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Qutb_Minar_2022.jpg/1280px-Qutb_Minar_2022.jpg',

  // Ecotourism & Wildlife
  'jim-corbett': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Bengal-Tiger_Corbett_Uttarakhand_Dec-2013.jpg/1280px-Bengal-Tiger_Corbett_Uttarakhand_Dec-2013.jpg',
  'jim-corbett-national-park': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Bengal-Tiger_Corbett_Uttarakhand_Dec-2013.jpg/1280px-Bengal-Tiger_Corbett_Uttarakhand_Dec-2013.jpg',
  'kaziranga-national-park': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Beauty_of_Kaziranga_National_Park.jpg/1280px-Beauty_of_Kaziranga_National_Park.jpg',
  'sundarbans-mangrove-forest': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Sundarban_Tiger.jpg/1280px-Sundarban_Tiger.jpg',
  'sundarbans-national-park': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Sundarban_Tiger.jpg/1280px-Sundarban_Tiger.jpg',

  // Trekking
  'triund-trek': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Triund_%2822356802630%29.jpg/1280px-Triund_%2822356802630%29.jpg',
  'valley-of-flowers': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Valley_of_flowers_national_park%2C_Uttarakhand%2C_India_03_%28edit%29.jpg/1280px-Valley_of_flowers_national_park%2C_Uttarakhand%2C_India_03_%28edit%29.jpg',
  'valley-of-flowers-trek': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Valley_of_flowers_national_park%2C_Uttarakhand%2C_India_03_%28edit%29.jpg/1280px-Valley_of_flowers_national_park%2C_Uttarakhand%2C_India_03_%28edit%29.jpg',
  'kudremukh-peak-trek': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Kudremukh_national_park.jpg/1280px-Kudremukh_national_park.jpg',
  'kudremukh-trek': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Kudremukh_national_park.jpg/1280px-Kudremukh_national_park.jpg',

  // Water Sports
  'havelock-island': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Havelock%2C_Andaman_%26_Nicobar_Islands.JPG/1280px-Havelock%2C_Andaman_%26_Nicobar_Islands.JPG',
  'rishikesh-white-water-rafting': 'https://upload.wikimedia.org/wikipedia/commons/1/15/Rafting_in_the_Ganga%2C_Rishikesh.jpg',
  'rishikesh-river-rafting': 'https://upload.wikimedia.org/wikipedia/commons/1/15/Rafting_in_the_Ganga%2C_Rishikesh.jpg',
  'netrani-island-scuba': 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Netrani_Island_Arial_View.jpg',
  'netrani-island': 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Netrani_Island_Arial_View.jpg',

  // Beach Resorts
  'palolem-beach': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Palolem_Beach%2C_South_Goa.jpg/1280px-Palolem_Beach%2C_South_Goa.jpg',
  'varkala-cliff-beach': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Varkala_beach_from_above.jpg/1280px-Varkala_beach_from_above.jpg',
  'marina-beach-chennai': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Chennai_Marina_beach_panorama1.jpg/1280px-Chennai_Marina_beach_panorama1.jpg',

  // Cultural Heritage
  'hampi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Stone_Chariot%2C_Hampi.jpg/1280px-Stone_Chariot%2C_Hampi.jpg',
  'ajanta-and-ellora-caves': 'https://upload.wikimedia.org/wikipedia/commons/1/15/Ellora_cave16_001.jpg',
  'khajuraho-monuments': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/1_Khajuraho.jpg/1280px-1_Khajuraho.jpg',
};

export const DEFAULT_FALLBACK_IMAGES: Record<string, string> = {
  'temples-and-sacred-shrines': 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1200&q=80',
  'monuments': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
  'beach-resorts': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Palolem_Beach%2C_South_Goa.jpg/1280px-Palolem_Beach%2C_South_Goa.jpg',
  'cultural-heritage': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
  'ecotourism-and-wildlife': 'https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=1200&q=80',
  'trekking': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
  'water-sports': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  default: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80',
};

export const getPlaceImageUrl = (url?: string, categorySlug?: string, placeSlug?: string): string => {
  if (placeSlug && PLACE_SPECIFIC_IMAGES[placeSlug]) {
    return PLACE_SPECIFIC_IMAGES[placeSlug];
  }
  if (url && url.startsWith('http') && !url.includes('photo-1600100397608')) {
    return url;
  }
  if (categorySlug && DEFAULT_FALLBACK_IMAGES[categorySlug]) {
    return DEFAULT_FALLBACK_IMAGES[categorySlug];
  }
  return DEFAULT_FALLBACK_IMAGES.default;
};

export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  categorySlug?: string,
  placeSlug?: string
): void => {
  const target = e.currentTarget;
  const fallback =
    (placeSlug && PLACE_SPECIFIC_IMAGES[placeSlug]) ||
    (categorySlug && DEFAULT_FALLBACK_IMAGES[categorySlug]) ||
    DEFAULT_FALLBACK_IMAGES.default;
  if (target.src !== fallback) {
    target.src = fallback;
  }
};
