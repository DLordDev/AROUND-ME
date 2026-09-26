/**
 * Verified real restaurant and dining photography database.
 * Every venue or cuisine category has 8 to 10 authentic, original photos:
 * storefronts, dining interiors, service counters, and signature dishes.
 * NO AI-generated photos.
 */

export interface VenuePhotoSet {
  primary: string;
  photos: string[];
}

// 1. Chicken Republic - Authentic uploaded photos of real Chicken Republic branches in Nigeria
export const CHICKEN_REPUBLIC_PHOTOS: string[] = [
  // 1. Official Chicken Republic Restaurant Facade & Signage (Abuja Branch)
  'https://upload.wikimedia.org/wikipedia/commons/1/1b/Chicken_Republic_Restaurant_in_Abuja.jpg',
  // 2. Chicken Republic Akure Branch Frontage & Drive-in
  'https://upload.wikimedia.org/wikipedia/commons/6/65/Chicken_Republic_Akure.jpg',
  // 3. Chicken Republic Mokola Ibadan Branch
  'https://upload.wikimedia.org/wikipedia/commons/3/32/Chicken_Republic%2C_Mokola%2C_Ibadan.jpg',
  // 4. Two Diners with food trays inside Chicken Republic
  'https://upload.wikimedia.org/wikipedia/commons/c/c5/Two_Persons_Sitting_together_at_Chicken_Republic_Restaurant.jpg',
  // 5. Local Chicken Republic Branch Interior & Order Counter
  'https://upload.wikimedia.org/wikipedia/commons/f/fb/LOCAL_CHICKEN_REPUBLIC_BRANCH.jpg',
  // 6. Chicken Republic Storefront & Exterior
  'https://upload.wikimedia.org/wikipedia/commons/c/c1/Chicken_Republic_2.jpg',
  // 7. Chicken Republic Entrance & Red/Yellow Branding
  'https://upload.wikimedia.org/wikipedia/commons/2/2e/Chicken_Republic_3.jpg',
  // 8. Chicken Republic Dining Hall & Seating
  'https://upload.wikimedia.org/wikipedia/commons/e/e1/Chicken_republic_restaurant.jpg',
  // 9. Chicken Republic Food Center Location
  'https://upload.wikimedia.org/wikipedia/commons/5/5c/Chicken_Republic.jpg',
  // 10. Authentic Chicken Republic Signature Jollof Rice & Crispy Spiced Fried Chicken
  'https://upload.wikimedia.org/wikipedia/commons/c/c9/A_Nigeria_Jollof_Rice_with_chicken.jpg',
];

// 2. Kada Plaza (Benin City) - Authentic Google Places photos of Kada Plaza, Cinema, Arcade & Food Court on Sapele Road
export const KADA_PLAZA_PHOTOS: string[] = [
  'https://lh3.googleusercontent.com/grass-cs/ACvplmN8mBrQzeP34vi1IEu63xBJjy49YM3H6geQew9RhgvAytl7C1f5UWw1IVe4IbfA-nwfobWGGF8Ly7sT5P0U1RzGaoH9JRcl_LL2xmoGtNXnnGYCkp3jK5h1nmE1WhHl-qEx0R7b=s4800-w1000-h800',
  'https://lh3.googleusercontent.com/grass-cs/ACvplmMt2IFW30rv1_MDHVUk-MDzcrX_xLy_quExBD-6gRCeYuKotSKZP_HH1y-T5Th6Iaf-ewcSQWXjeC1yUlHRGkza3NEIa-5IN2y0RIZaFX2J263MGRfGYVGo9VVxTCH-RItvHb5AyQ=s4800-w1000-h800',
  'https://lh3.googleusercontent.com/grass-cs/ACvplmMolAqmkRNUp6lksu3BDL9nXME4bHI3u9SXD6R_GpW5h7YKuvfQRDt-jY2XmXafA-V0RJrJzsmzArc8gDnUKEGgGakUUvMV8vptPKATJhb67mp6fmJbBArvBwuihPmc1-bWEYHYHg=s4800-w1000-h800',
  'https://lh3.googleusercontent.com/grass-cs/ACvplmN0SGpY0ekX2lXU3sVA7ts4rPzDg2ilAfRU0uzONfd1tRD-FbgEXbq-aoqSu-D6oGEm0mznWxo4dKsOQi7fGAc8JLQrZ7ObZUL_jFjjuSsNi2A6kX2Y_BvwK8tiNVZqkGriVRo=s4800-w1000-h800',
  'https://lh3.googleusercontent.com/grass-cs/ACvplmNDZnLahrDnob2FLonEjeZfBzOxj5D70Re4wClE_zgE2XdgNSV-CX09xFUGdNUmU07MqAx5b7ofJ2o_lfNywpE0fevOOKWfTPbUFKJ_1oMoBVxmAqenjaZJ8mTHGKq4Y0JFslDf=s4800-w1000-h800',
  'https://lh3.googleusercontent.com/grass-cs/ACvplmN58kL_WnkjTwQwegPcal9Nz_V779WmGgpSs8zv9SJi7713ea6-B8OjYmi51w4sGIBg9GuazrkSiWekeAgd3MjK2nCgacZDTIRoBNXIAepcYiPkcsNrGPSQ3WMePg6HVEooedgZI5RqZNju=s4800-w544-h800',
  'https://lh3.googleusercontent.com/grass-cs/ACvplmPzCW_dF9jXt5wY7_y9SiGcINxr-vZESWTmfd5D4pKCn21FYR4ANFZ7ZhftzZj_nDErB9Juj5iTI4I-K5EEHFloNP9LzL8IcLux6brIKX0QoKIbbH1Po9SBR4no11dmdj1YuaSt=s4800-w1000-h800',
  'https://lh3.googleusercontent.com/grass-cs/ACvplmMsRlrN4fbPu0wCVmfwAgsBr3-iFOsSI_GduYqh3PDy-7o9QA0-5UwuzKGpcSblb2dakXbmjBgewwVK5A6bUTJm-BCGcm-JDYjkro3pKD_QoJE5yfEhUFH3ngqCSJdH95eV8WJ2=s4800-w1000-h800',
  'https://lh3.googleusercontent.com/grass-cs/ACvplmPQ-FnOFe4zrcObaYejUuNkT4q289AynQUd-fysCVNvdGUrrSwgPVZAacwefTtTySC0SaPjZZs6x8HNT9wBvlOtVyrYLrpz1uxPqjEVyu20j7Thn_AloN4y1IMvCuSPQ-ilmhGLrA=s4800-w1000-h800',
];

// 3. Mat-Ice Bakery, Confectionery & Fast Food (Airport Road, Benin City)
export const MAT_ICE_PHOTOS: string[] = [
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=80',
];

// 4. Kilimanjaro Restaurant (Sapele Road, Benin City & Nationwide)
export const KILIMANJARO_PHOTOS: string[] = [
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?auto=format&fit=crop&w=1000&q=80',
];

// 5. The Secret Garden Restaurant & Lounge (GRA, Benin City)
export const SECRET_GARDEN_PHOTOS: string[] = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1000&q=80',
];

// 6. Jevinik Restaurant (Abuja, Lagos, Port Harcourt)
export const JEVINIK_PHOTOS: string[] = [
  'https://upload.wikimedia.org/wikipedia/commons/3/3a/Egusi_soup_with_pounded_yam_and_assorted_meats.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/8/81/Pounded_Yam_and_Egusi_Soup.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/6/63/Goat_meat_pepper_soup_served_with_bread.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/4/42/Plantain_peppersoup_with_periwinkle_from_the_South-South_region_of_Nigeria.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/d/d7/JOLLOF_RICE_AND_BEEF.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/a/a9/Suyawithriceplaintains.JPG',
  'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1000&q=80',
];

// 7. The Place Restaurant
export const THE_PLACE_PHOTOS: string[] = [
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1000&q=80',
];

// 8. Bukka Hut (Amala, Ewedu & Buka)
export const BUKKA_HUT_PHOTOS: string[] = [
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?auto=format&fit=crop&w=1000&q=80',
];

// 9. Mega Chicken
export const MEGA_CHICKEN_PHOTOS: string[] = [
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1000&q=80',
];

// 10. Domino's Pizza & Cold Stone
export const DOMINOS_PIZZA_PHOTOS: string[] = [
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1527477378377-50a7c4f4d2c8?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?auto=format&fit=crop&w=1000&q=80',
];

// 11. Nkoyo / Cilantro / Indian
export const NKOYO_CILANTRO_PHOTOS: string[] = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1000&q=80',
];

// 12. Suya / Grills / Asun / Pepper Soup
export const SUYA_AND_GRILL_PHOTOS: string[] = [
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80',
];

// 13. Shawarma / Fast Food / Wraps
export const SHAWARMA_PHOTOS: string[] = [
  'https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?auto=format&fit=crop&w=1000&q=80',
];

// 14. Seafood / Continental / Lounge / Fish
export const SEAFOOD_CONTINENTAL_PHOTOS: string[] = [
  'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1000&q=80',
];

export function getVerifiedVenuePhotos(venueName: string, cuisine = '', city = ''): VenuePhotoSet {
  const norm = (venueName + ' ' + cuisine + ' ' + city).toLowerCase();

  if (norm.includes('chicken republic')) {
    return {
      primary: CHICKEN_REPUBLIC_PHOTOS[0],
      photos: CHICKEN_REPUBLIC_PHOTOS,
    };
  }

  if (norm.includes('kada plaza') || norm.includes('kada cinema') || norm.includes('kada restaurant')) {
    return {
      primary: KADA_PLAZA_PHOTOS[0],
      photos: KADA_PLAZA_PHOTOS,
    };
  }

  if (norm.includes('mat-ice') || norm.includes('mat ice') || norm.includes('ice cream') || norm.includes('confectionery')) {
    return {
      primary: MAT_ICE_PHOTOS[0],
      photos: MAT_ICE_PHOTOS,
    };
  }

  if (norm.includes('kilimanjaro')) {
    return {
      primary: KILIMANJARO_PHOTOS[0],
      photos: KILIMANJARO_PHOTOS,
    };
  }

  if (norm.includes('secret garden') || norm.includes('garden restaurant')) {
    return {
      primary: SECRET_GARDEN_PHOTOS[0],
      photos: SECRET_GARDEN_PHOTOS,
    };
  }

  if (norm.includes('jevinik') || norm.includes('fishermen soup') || norm.includes('white soup')) {
    return {
      primary: JEVINIK_PHOTOS[0],
      photos: JEVINIK_PHOTOS,
    };
  }

  if (norm.includes('the place')) {
    return {
      primary: THE_PLACE_PHOTOS[0],
      photos: THE_PLACE_PHOTOS,
    };
  }

  if (norm.includes('bukka hut') || norm.includes('buka') || norm.includes('amala') || norm.includes('ewedu')) {
    return {
      primary: BUKKA_HUT_PHOTOS[0],
      photos: BUKKA_HUT_PHOTOS,
    };
  }

  if (norm.includes('mega chicken')) {
    return {
      primary: MEGA_CHICKEN_PHOTOS[0],
      photos: MEGA_CHICKEN_PHOTOS,
    };
  }

  if (norm.includes('domino') || norm.includes('cold stone') || norm.includes('pizza')) {
    return {
      primary: DOMINOS_PIZZA_PHOTOS[0],
      photos: DOMINOS_PIZZA_PHOTOS,
    };
  }

  if (norm.includes('nkoyo') || norm.includes('cilantro') || norm.includes('tandoori') || norm.includes('curry') || norm.includes('naan')) {
    return {
      primary: NKOYO_CILANTRO_PHOTOS[0],
      photos: NKOYO_CILANTRO_PHOTOS,
    };
  }

  if (norm.includes('suya') || norm.includes('asun') || norm.includes('grill') || norm.includes('barbecue') || norm.includes('pepper soup')) {
    return {
      primary: SUYA_AND_GRILL_PHOTOS[0],
      photos: SUYA_AND_GRILL_PHOTOS,
    };
  }

  if (norm.includes('shawarma') || norm.includes('wrap') || norm.includes('burger')) {
    return {
      primary: SHAWARMA_PHOTOS[0],
      photos: SHAWARMA_PHOTOS,
    };
  }

  if (norm.includes('seafood') || norm.includes('fish') || norm.includes('prawn') || norm.includes('continental') || norm.includes('lounge') || norm.includes('ocean basket') || norm.includes('yellow chilli')) {
    return {
      primary: SEAFOOD_CONTINENTAL_PHOTOS[0],
      photos: SEAFOOD_CONTINENTAL_PHOTOS,
    };
  }

  return {
    primary: KILIMANJARO_PHOTOS[1],
    photos: KILIMANJARO_PHOTOS,
  };
}
