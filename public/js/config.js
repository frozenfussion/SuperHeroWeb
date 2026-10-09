// Static data for Superhero Maker: builder options, default prompt, model list.
// This file is imported by the browser and by the server (for the copyright guardrail).

const O = (names) => names.map((n) => ({ n }));
const S = (pairs) => pairs.map(([n, c]) => ({ n, c }));

// Always appended to every prompt, in the browser and again on the server.
export const GUARDRAIL =
  'Create an original character. Do not reproduce or imitate any copyrighted characters, logos, or trademarked material.';

// Hard-coded image models. "Custom" is handled in the Settings screen.
export const MODELS = [
  { id: 'gpt-image-2.5-sunburst', label: 'GPT-Image-2.5 Sunburst' },
  { id: 'gpt-image-2.5-flare', label: 'GPT-Image-2.5 Flare' },
  { id: 'gpt-image-2', label: 'GPT-Image-2' },
];
export const CUSTOM_MODEL = '__custom';
export const DEFAULT_MODEL = 'gpt-image-2.5-flare';

// Quality values differ by model (2.5 models accept more levels).
export function qualityOptions(model) {
  if (model === 'gpt-image-2') return ['auto', 'low', 'medium', 'high'];
  return ['auto', 'low', 'medium', 'high', 'xhigh', 'max'];
}

export const STEPS = [
  {
    label: 'Who',
    title: 'Who are they?',
    sub: 'Start with where they come from, then shape how they look. Pick as many origins as you like.',
    sections: [
      { key: 'origin', label: 'Origin', mode: 'multi', opts: O(['Human', 'Enhanced human', 'Cyborg', 'Mutant', 'Alien', 'Robot / AI', 'Android', 'Spirit / ghost', 'God / goddess', 'Demon', 'Angel', 'Mythical creature', 'Elemental being', 'Animal hybrid', 'Plant being', 'Undead', 'Living construct', 'Shapeshifter', 'Dimensional traveler', 'Time traveler', 'Vampire', 'Werewolf', 'Fae', 'Dragon-kin', 'Giant', 'Tiny being']) },
      { key: 'gender', label: 'Gender presentation', mode: 'single', opts: O(['Male', 'Female', 'Non-binary', 'Androgynous', 'Genderless', 'Gender-fluid']) },
      { key: 'build', label: 'Build', mode: 'single', opts: O(['Slim', 'Athletic', 'Muscular', 'Curvy', 'Stocky', 'Tall and lanky', 'Short', 'Towering giant']) },
      { key: 'skin', label: 'Skin', mode: 'single', opts: S([['Porcelain', '#f3d9c8'], ['Fair', '#e8be9d'], ['Olive', '#c99a6b'], ['Golden', '#d4a05a'], ['Tan', '#b27a4f'], ['Brown', '#8a5a3a'], ['Deep brown', '#5c3a26'], ['Ebony', '#3a2418'], ['Blue', '#4a7bd8'], ['Green', '#4fae6a'], ['Purple', '#8a5bd0'], ['Red', '#c8433f'], ['Metallic', '#aab4c4'], ['Crystal', '#9fe3f0'], ['Glowing', '#fff3a0'], ['Shadow', '#1b1b2b']]) },
      { key: 'hair_style', label: 'Hair style', mode: 'single', opts: O(['Bald', 'Buzz cut', 'Short crop', 'Undercut', 'Long and flowing', 'Ponytail', 'Braids', 'Locs', 'Afro', 'Curly', 'Spiky', 'Mohawk', 'Bun', 'Pigtails', 'Hair of fire', 'Hair of energy', 'Hidden by headgear']) },
      { key: 'hair_color', label: 'Hair color', mode: 'single', opts: S([['Black', '#15151c'], ['Dark brown', '#3b2417'], ['Brown', '#6b4423'], ['Blonde', '#e6c36a'], ['Auburn', '#8c3a1f'], ['Red', '#c8302f'], ['Silver', '#c5cad6'], ['White', '#f4f4f8'], ['Blue', '#3b6fe0'], ['Pink', '#ff7ab8'], ['Purple', '#8c4fe0'], ['Green', '#3fbf72'], ['Rainbow', '#ffb347'], ['Gradient', '#7f5bff']]) },
      { key: 'eyes', label: 'Eyes', mode: 'single', opts: O(['Natural', 'Glowing', 'Heterochromia', 'Blank white', 'Cybernetic', 'Slit pupils', 'Starry', 'Hidden behind a visor']) },
      { key: 'abilities', label: 'Abilities and access', mode: 'multi', optional: true, hint: 'Design features, shown with pride', opts: O(['Wheelchair', 'Prosthetic arm', 'Prosthetic leg', 'Limb difference', 'Cane', 'Crutches', 'Hearing aids', 'Glasses', 'Vitiligo', 'Birthmark', 'Scars', 'Freckles', 'Tattoos']) },
    ],
  },
  {
    label: 'Costume',
    title: 'Suit up',
    sub: 'Headgear, outfit and gear. Mix as many pieces as you want.',
    sections: [
      { key: 'headgear', label: 'Headgear', mode: 'multi', exclusive: 'None', opts: O(['None', 'Full helmet', 'Half helmet', 'Domino mask', 'Full mask', 'Cowl', 'Hood', 'Hijab', 'Headscarf', 'Turban', 'Kippah', 'Keffiyeh', 'Face veil', 'Bandana', 'Beret', 'Hat', 'Beanie', 'Crown', 'Tiara', 'Halo', 'Horns', 'Antlers', 'Goggles', 'Cyber headset']) },
      { key: 'outfit', label: 'Outfit', mode: 'multi', opts: O(['Spandex bodysuit', 'Tactical armor', 'Power armor', 'Robes', 'Trench coat', 'Jacket', 'Hoodie', 'Streetwear', 'Formal suit', 'Lab coat', 'Jumpsuit', 'Cloak', 'Cape', 'Boots', 'Sari-inspired', 'Abaya-inspired', 'Thobe-inspired', 'Kimono-inspired', 'Hanbok-inspired', 'Dashiki-inspired', 'Kente-inspired']) },
      { key: 'outfit_colors', label: 'Outfit colors', mode: 'multi', opts: S([['Crimson', '#d1243f'], ['Navy', '#1c2f6b'], ['Gold', '#e8b931'], ['Emerald', '#1f9d63'], ['Violet', '#7a45d6'], ['Teal', '#16a3a3'], ['Orange', '#f2762e'], ['White', '#f4f4f8'], ['Black', '#15151c'], ['Silver', '#b9c0cf'], ['Pink', '#ff6fae'], ['Sky blue', '#5bb8f5']]) },
      { key: 'materials', label: 'Materials', mode: 'multi', optional: true, opts: O(['Leather', 'Metal plating', 'Glowing fabric', 'Crystal', 'Cloth', 'Scales', 'Bone', 'Vines and leaves']) },
      { key: 'accessories', label: 'Accessories', mode: 'multi', opts: O(['Gloves', 'Gauntlets', 'Utility belt', 'Shield', 'Sword', 'Staff', 'Hammer', 'Bow', 'Energy blaster', 'Jetpack', 'Wings', 'Tail', 'Amulet', 'Jewelry', 'Scarf', 'Backpack', 'Wrist device', 'Drone companion', 'Animal sidekick', 'Spirit familiar', 'Floating orbs']) },
    ],
  },
  {
    label: 'Power',
    title: 'Unleash the power',
    sub: 'Search the list or just scroll. Choose a glow color, then strike a pose.',
    sections: [
      { key: 'powers', label: 'Superpowers', mode: 'multi', search: true, opts: O(['Fire', 'Ice', 'Lightning', 'Water control', 'Earth control', 'Wind control', 'Lava', 'Sand', 'Crystal', 'Storm', 'Plasma', 'Metal control', 'Super strength', 'Super speed', 'Flight', 'Invulnerability', 'Regeneration', 'Healing', 'Elasticity', 'Wall-crawling', 'Size change', 'Shapeshifting', 'Teleportation', 'Portals', 'Gravity control', 'Time control', 'Dimension hopping', 'Cosmic power', 'Telepathy', 'Telekinesis', 'Mind control', 'Illusions', 'Precognition', 'Dream control', 'Emotion control', 'Memory control', 'Invisibility', 'Phasing', 'Duplication', 'Force fields', 'Energy blasts', 'Laser eyes', 'Shadow control', 'Light control', 'Sound waves', 'Magnetism', 'Poison', 'Plant control', 'Animal control', 'Summoning', 'Spirit speaking', 'Technopathy', 'Nanotech swarm', 'Luck manipulation', 'Super senses']) },
      { key: 'power_color', label: 'Power glow', mode: 'single', opts: S([['Electric blue', '#3d7bff'], ['Crimson', '#ff3b4e'], ['Gold', '#ffc933'], ['Emerald', '#2fe08a'], ['Violet', '#9b5cff'], ['Magenta', '#ff3d83'], ['Cyan', '#40e0ff'], ['White', '#f4f6ff'], ['Orange', '#ff8a2b'], ['Teal', '#1fd1c1'], ['Shadow black', '#2a2a3d']]) },
      { key: 'pose', label: 'Pose', mode: 'single', opts: O(['Heroic stance', 'Flying', 'Superhero landing', 'Mid-punch', 'Firing power', 'Arms crossed', 'Sprinting', 'Leaping', 'Floating cross-legged', 'Crouching on a ledge', 'Looking over the shoulder', 'Back view over a city', 'Cape in the wind', 'Shielding others', 'Victory pose', 'Casual lean']) },
      { key: 'camera', label: 'Camera shot', mode: 'single', opts: O(['Full body', 'Three-quarter', 'Portrait', 'Low angle', 'Wide dynamic', "Bird's eye"]) },
    ],
  },
  {
    label: 'World',
    title: 'Set the scene',
    sub: 'Where are they, what is the mood, and how should it be drawn?',
    sections: [
      { key: 'setting', label: 'Setting', mode: 'single', opts: O(['City rooftop', 'Neon street at night', 'Space station', 'Alien planet', 'Desert', 'Ancient ruins', 'Underwater', 'Ice world', 'Jungle', 'Volcano', 'Floating islands', 'Futuristic city', 'Medieval castle', 'Laboratory', 'Battlefield', 'Mountain peak', 'Temple', 'Subway tunnel']) },
      { key: 'atmosphere', label: 'Atmosphere', mode: 'multi', opts: O(['Dawn', 'Midday', 'Sunset', 'Night', 'Rain', 'Fog', 'Snow', 'Thunderstorm', 'Moonlit', 'Neon glow', 'Dramatic shadows', 'Epic', 'Moody', 'Hopeful', 'Gritty', 'Dreamy']) },
      { key: 'style', label: 'Art style', mode: 'single', hint: 'One style only', opts: O(['Anime', 'Manga (B&W)', 'Arcane style', 'Cyberpunk', 'Retro 80s synthwave', 'Retro comic', 'Modern comic', 'Noir', 'Pixel art', '3D animated', 'Watercolor', 'Ukiyo-e', 'Pop art', 'Steampunk', 'Dark fantasy', 'Cel-shaded', 'Claymation', 'Paper-cut', 'Low-poly', 'Stained glass', 'Graffiti', 'Art nouveau', 'Sci-fi concept art', 'Cinematic realistic', 'Chibi']) },
    ],
  },
  {
    label: 'Forge',
    title: 'Forge the hero',
    sub: 'Add a final twist, check the prompt, then generate.',
    sections: [],
  },
];

// Every section by key, for quick lookup.
export const SECTIONS = {};
for (const step of STEPS) for (const s of step.sections) SECTIONS[s.key] = s;

// Master template. One line per detail; a line is dropped when its choice is empty.
export const DEFAULT_TEMPLATE = [
  'Create an original superhero character illustration.',
  'Origin: {origin}',
  'Gender presentation: {gender}',
  'Build: {build}',
  'Skin: {skin}',
  'Hair style: {hair_style}',
  'Hair color: {hair_color}',
  'Eyes: {eyes}',
  'Abilities and access: {abilities}',
  'Headgear: {headgear}',
  'Outfit: {outfit}',
  'Outfit colors: {outfit_colors}',
  'Materials: {materials}',
  'Accessories: {accessories}',
  'Superpowers: {powers}',
  'Power glow color: {power_color}',
  'Pose: {pose}',
  'Camera shot: {camera}',
  'Setting: {setting}',
  'Atmosphere: {atmosphere}',
  'Art style: {style}',
  'Extra details: {twist}',
].join('\n');

// Wording sent to the model for each art style. Editable in Settings.
export const DEFAULT_STYLES = {
  'Anime': 'vibrant Japanese anime illustration, clean linework, expressive eyes, dynamic cel shading and dramatic action framing',
  'Manga (B&W)': 'black-and-white manga page art, bold ink lines, screentone shading, speed lines and high-contrast panels',
  'Arcane style': 'stylized painterly 2.5D animated-series look, visible brushwork on textured surfaces, rich moody lighting and bold color grading, original design',
  'Cyberpunk': 'cyberpunk aesthetic, neon-soaked rain-slick city, holographic signage, high-contrast magenta and cyan lighting, gritty high-tech detail',
  'Retro 80s synthwave': '1980s retro synthwave look, neon grid horizon, airbrushed gradients, chrome highlights and VHS glow',
  'Retro comic': 'vintage golden-age comic print look, Ben-Day halftone dots, limited ink palette, bold black outlines and off-register color',
  'Modern comic': 'modern superhero comic book art, dynamic anatomy, heavy inks, dramatic foreshortening and rich digital coloring',
  'Noir': 'film-noir style, deep black shadows, hard directional light, light slats through blinds, mostly monochrome with one accent color',
  'Pixel art': 'detailed 16-bit pixel art, limited palette, crisp pixels, sprite-style shading',
  '3D animated': 'polished 3D animated feature-film look, soft subsurface skin shading, expressive stylized proportions, cinematic lighting',
  'Watercolor': 'loose watercolor painting, soft bleeding washes, visible paper texture and ink accents',
  'Ukiyo-e': 'Japanese ukiyo-e woodblock print style, flat color areas, bold outlines, patterned textures and wave motifs',
  'Pop art': 'pop-art style, saturated flat colors, thick outlines, halftone dots and comic burst shapes',
  'Steampunk': 'steampunk look, brass gears, copper pipes, leather and goggles, Victorian industrial detail, warm smoky lighting',
  'Dark fantasy': 'dark fantasy painting, gothic atmosphere, weathered armor, mist, dramatic chiaroscuro and a muted palette',
  'Cel-shaded': 'cel-shaded 3D look with hard-edged shadows, flat color bands and bold outlines',
  'Claymation': 'stop-motion claymation look, visible fingerprints in the clay, handmade miniature set, soft studio lighting',
  'Paper-cut': 'layered paper-cut diorama, visible paper edges and depth shadows between layers',
  'Low-poly': 'low-poly 3D style, faceted geometric surfaces, flat-shaded triangles, clean gradients',
  'Stained glass': 'stained-glass window style, bold black lead lines, jewel-toned glass segments and backlit glow',
  'Graffiti': 'street graffiti mural style, spray-paint textures, drips and bold shapes on a brick wall',
  'Art nouveau': 'art nouveau poster style, flowing organic lines, ornamental borders, muted elegant palette',
  'Sci-fi concept art': 'high-end sci-fi concept art, detailed hard-surface design, atmospheric perspective and cinematic lighting',
  'Cinematic realistic': 'photorealistic cinematic still, realistic materials, shallow depth of field, film-grade lighting',
  'Chibi': 'chibi style, oversized head and tiny body, cute simplified features, bright colors with bold outlines',
};
