// ASADCORE content. All external IDs below were checked for reachable thumbnails / audio at build time.
// Runtime onError handlers additionally hide anything that becomes unavailable or non-embeddable.
export type VideoCategory = 'Dhaka & Bangladesh' | 'Space & Ambient' | 'Short Films' | 'Hollywood Trailers' | 'Bollywood Trailers' | 'Bangla Trailers' | 'Music Videos';
export interface VideoItem { title: string; category: VideoCategory; ytId?: string; src?: string; poster?: string; duration?: string; line: string; }
export interface MusicTrack { title: string; artist: string; genre: 'Dark Ambient' | 'Cinematic' | 'Lo-Fi' | 'Bangla' | 'Bollywood' | 'Electronic'; src?: string; ytId?: string; cover: string; license: string; }
export interface StreetLocation { id: string; name: string; region: string; panorama: string; license: string; lat: number; lng: number; ambient: 'city' | 'river' | 'sea' | 'forest' | 'tea' | 'mountain' | 'urban'; mapillary?: string; google?: string; }

export const CONFIG = {
  brand: 'ASADCORE',
  tagline: 'A Mind-Expanding Journey Through My World, My Chaos, My Universe.',
  email: '',
  street: { panorama: '' },
  secretsTotal: 12,
  history: [
    { year: '1608', title: 'A city begins to dream', era: 'MUGHAL DHAKA', text: 'The Buriganga carries a thousand stories. Boats, spice, monsoon rain — and a city learning its own name.', fact: 'Dhaka becomes the Mughal capital of Bengal.' },
    { year: '1717', title: 'Walls that remember', era: 'THE OLD QUARTER', text: 'Lalbagh rises in red stone. Behind its unfinished walls, gardens keep secrets the centuries forgot to write down.', fact: 'Lalbagh Fort remains an unfinished poem in brick.' },
    { year: '1874', title: 'The palace of water', era: 'AHSAN MANZIL', text: 'A pink silhouette beside the river. Rickshaw bells, shuttered windows, and the soft geometry of another time.', fact: 'Ahsan Manzil becomes a seat of the Nawabs of Dhaka.' },
    { year: '1952', title: 'A language becomes a light', era: 'THE LANGUAGE MOVEMENT', text: 'Bangla is spoken in the streets until it becomes something no one can silence. Every letter a small act of courage.', fact: 'The language movement shapes a nation’s identity.' },
    { year: '1971', title: 'After the long night', era: 'BANGLADESH', text: 'From darkness, a green and red dawn. The city rebuilds, but the river remembers every name.', fact: 'Bangladesh emerges as an independent nation.' },
    { year: 'NOW', title: 'The city never sleeps', era: 'NEON MONSOON', text: 'Old Dhaka folds into a new universe. Tea stalls glow under satellites. Somewhere, a rickshaw bell crosses a star.', fact: 'You are here. The next chapter is unwritten.' }
  ],
  videos: [
    { title: 'Bangladesh Dhaka — Overcrowded, Noisiest Country', category: 'Dhaka & Bangladesh', ytId: 'NHNBwlvDnoU', line: 'The city that never lowers its voice.' },
    { title: 'Dhaka Central Jail — Official Documentary', category: 'Dhaka & Bangladesh', ytId: 'PMONuB7BlMU', line: 'Behind the walls of Keraniganj.' },
    { title: 'Living in Bangladesh — 4K Documentary', category: 'Dhaka & Bangladesh', ytId: 'EWAhVoBkgj8', line: 'Inside one of Earth’s most crowded countries.' },
    { title: 'Timelapse of the Future — Journey to the End of Time', category: 'Space & Ambient', ytId: 'uD4izuDMUQA', line: 'From now to the last star.' },
    { title: 'Perseverance Rover’s Descent and Touchdown on Mars', category: 'Space & Ambient', ytId: '4czjS9h4Fpg', line: 'NASA’s seven minutes of terror.' },
    { title: 'Big Buck Bunny', category: 'Short Films', ytId: 'YE7VzlLtp-4', line: 'Blender Foundation open movie.' },
    { title: 'Sintel', category: 'Short Films', ytId: 'eRsGyueVLvQ', line: 'A lonely warrior’s search.' },
    { title: 'Tears of Steel', category: 'Short Films', ytId: 'R6MlUcmOul8', line: 'Blender VFX open movie.' },
    { title: 'Cosmos Laundromat — First Cycle', category: 'Short Films', ytId: 'Y-rmzh0PI3c', line: 'A suicidal sheep meets a strange salesman.' },
    { title: 'Dune: Part Two — Official Trailer', category: 'Hollywood Trailers', ytId: 'Way9Dexny3w', line: 'Long live the fighters.' },
    { title: 'Oppenheimer — New Trailer', category: 'Hollywood Trailers', ytId: 'uYPbbksJxIg', line: 'The world forever changes.' },
    { title: 'Interstellar — Official Trailer', category: 'Hollywood Trailers', ytId: 'zSWdZVtXT7E', line: 'Mankind was born on Earth. It was never meant to die here.' },
    { title: 'Inception — Official Trailer', category: 'Hollywood Trailers', ytId: 'YoHD9XEInc0', line: 'Your mind is the scene of the crime.' },
    { title: 'The Dark Knight — Official Trailer', category: 'Hollywood Trailers', ytId: 'EXeTwQWrcwY', line: 'Welcome to a world without rules.' },
    { title: 'Avatar: The Way of Water — Official Trailer', category: 'Hollywood Trailers', ytId: 'd9MyW72ELq0', line: 'Return to Pandora.' },
    { title: 'Pathaan — Official Trailer', category: 'Bollywood Trailers', ytId: 'vqu4z34wENw', line: 'Shah Rukh Khan returns.' },
    { title: 'Jawan — Official Hindi Trailer', category: 'Bollywood Trailers', ytId: 'COv52Qyctws', line: 'A man drives a vigilante movement.' },
    { title: 'Animal — Official Trailer', category: 'Bollywood Trailers', ytId: '8FkLRUJj-o0', line: 'A son’s violent devotion.' },
    { title: '3 Idiots — Official Trailer', category: 'Bollywood Trailers', ytId: 'K0eDlFX9GMc', line: 'Aal izz well.' },
    { title: 'Lagaan — Official Trailer', category: 'Bollywood Trailers', ytId: 'oSIGQ0YkFxs', line: 'Once upon a time in India.' },
    { title: 'Hawa — Official Bangla Trailer', category: 'Bangla Trailers', ytId: 'yhOIhko8VQ4', line: 'The sea keeps its secrets.' },
    { title: 'Priyotoma — Official Trailer', category: 'Bangla Trailers', ytId: 'oy7FY3k3TJc', line: 'Love entangled with crime.' },
    { title: 'Surongo — Official Trailer', category: 'Bangla Trailers', ytId: '9OuJwweHJ_I', line: 'A man turns to crime to save his family.' },
    { title: 'Coldplay — Yellow (Official Video)', category: 'Music Videos', ytId: 'yKNxeF4KMsY', line: 'Look at the stars.' },
    { title: 'Alan Walker — Faded', category: 'Music Videos', ytId: '60ItHLz5WEA', line: 'Where are you now?' },
    { title: 'Shob Lokey Koy — Coke Studio Bangla', category: 'Music Videos', ytId: 'L-arhlgPiy8', line: 'Baul folk for the modern age.' },
    { title: 'Tum Hi Ho — Aashiqui 2', category: 'Music Videos', ytId: 'Umqb9KENgmk', line: 'Arijit Singh’s defining ballad.' },
    { title: 'Chaiyya Chaiyya — Dil Se (4K Remastered)', category: 'Music Videos', ytId: 'K-pX4qwtAxA', line: 'A. R. Rahman on top of a train.' }
  ] as VideoItem[],
  music: [
    { title: 'Dark Part 1', artist: 'Ambient Collective (usr)', genre: 'Dark Ambient', src: 'https://archive.org/download/ambcol_dark/01._dark-usr_64kb.mp3', cover: 'https://archive.org/services/img/ambcol_dark', license: 'CC BY-ND 3.0' },
    { title: 'Dark Part 2', artist: 'Ambient Collective (unseen)', genre: 'Dark Ambient', src: 'https://archive.org/download/ambcol_dark/02._dark-aka_unseen-gregg_plummer_64kb.mp3', cover: 'https://archive.org/services/img/ambcol_dark', license: 'CC BY-ND 3.0' },
    { title: 'Dark Part 3', artist: 'Ambient Collective (rifts)', genre: 'Dark Ambient', src: 'https://archive.org/download/ambcol_dark/03._dark-aka-rifts_form_upon_the_earth-muchael_meara_64kb.mp3', cover: 'https://archive.org/services/img/ambcol_dark', license: 'CC BY-ND 3.0' },
    { title: 'Dark Part 4', artist: 'Ambient Collective (Altus)', genre: 'Dark Ambient', src: 'https://archive.org/download/ambcol_dark/04._dark-aka_umbra-altus_64kb.mp3', cover: 'https://archive.org/services/img/ambcol_dark', license: 'CC BY-ND 3.0' },
    { title: 'Dark Part 6', artist: 'Ambient Collective (ESP)', genre: 'Dark Ambient', src: 'https://archive.org/download/ambcol_dark/06._dark-modulater_esp_64kb.mp3', cover: 'https://archive.org/services/img/ambcol_dark', license: 'CC BY-ND 3.0' },
    { title: 'Dark Part 7', artist: 'Ambient Collective (Sonoprint)', genre: 'Dark Ambient', src: 'https://archive.org/download/ambcol_dark/07._dark-sonoprint_64kb.mp3', cover: 'https://archive.org/services/img/ambcol_dark', license: 'CC BY-ND 3.0' },
    { title: 'Warm Jets', artist: 'Daniel Robert Lahey', genre: 'Cinematic', src: 'https://archive.org/download/freefloatingmusic013/01%20-%20Warm%20Jets.mp3', cover: 'https://archive.org/services/img/freefloatingmusic013', license: 'CC BY-NC-ND 4.0' },
    { title: 'Exanimate', artist: 'Daniel Robert Lahey', genre: 'Cinematic', src: 'https://archive.org/download/freefloatingmusic013/02%20-%20Exanimate.mp3', cover: 'https://archive.org/services/img/freefloatingmusic013', license: 'CC BY-NC-ND 4.0' },
    { title: 'Empathetic', artist: 'Daniel Robert Lahey', genre: 'Cinematic', src: 'https://archive.org/download/freefloatingmusic013/03%20-%20Empathetic.mp3', cover: 'https://archive.org/services/img/freefloatingmusic013', license: 'CC BY-NC-ND 4.0' },
    { title: 'Shafts of Sunlight', artist: 'Daniel Robert Lahey', genre: 'Cinematic', src: 'https://archive.org/download/freefloatingmusic013/05%20-%20Shafts%20of%20Sunlight.mp3', cover: 'https://archive.org/services/img/freefloatingmusic013', license: 'CC BY-NC-ND 4.0' },
    { title: 'Twilight Tapestry', artist: 'Daniel Robert Lahey', genre: 'Cinematic', src: 'https://archive.org/download/freefloatingmusic013/07%20-%20Twilight%20Tapestry.mp3', cover: 'https://archive.org/services/img/freefloatingmusic013', license: 'CC BY-NC-ND 4.0' },
    { title: 'Peaceful', artist: 'Daniel Robert Lahey', genre: 'Cinematic', src: 'https://archive.org/download/freefloatingmusic013/08%20-%20Peaceful.mp3', cover: 'https://archive.org/services/img/freefloatingmusic013', license: 'CC BY-NC-ND 4.0' },
    { title: 'Narrow Vision', artist: 'Randolf Scand', genre: 'Electronic', src: 'https://archive.org/download/various-artists-united-in-dust-reality/02.Randolf%20Scand%20-%20Narrow%20Vision.mp3', cover: 'https://archive.org/services/img/various-artists-united-in-dust-reality', license: 'CC BY-SA 4.0' },
    { title: 'Electronic Blizzard', artist: 'Derek Nigell', genre: 'Electronic', src: 'https://archive.org/download/various-artists-united-in-dust-reality/04.Derek%20Nigell%20-%20Electronic%20Blizzard.mp3', cover: 'https://archive.org/services/img/various-artists-united-in-dust-reality', license: 'CC BY-SA 4.0' },
    { title: 'Spirit of Times', artist: 'Platinum Sky', genre: 'Electronic', src: 'https://archive.org/download/various-artists-united-in-dust-reality/05.Platinum%20Sky%20-%20Spirit%20of%20Times.mp3', cover: 'https://archive.org/services/img/various-artists-united-in-dust-reality', license: 'CC BY-SA 4.0' },
    { title: 'Elegy', artist: 'Okkulta', genre: 'Electronic', src: 'https://archive.org/download/various-artists-united-in-dust-reality/07.Okkulta%20-%20Elegy.mp3', cover: 'https://archive.org/services/img/various-artists-united-in-dust-reality', license: 'CC BY-SA 4.0' },
    { title: 'Elektrotrennung', artist: 'WMRI', genre: 'Electronic', src: 'https://archive.org/download/various-artists-united-in-dust-reality/09.WMRI%20-%20Elektrotrennung.mp3', cover: 'https://archive.org/services/img/various-artists-united-in-dust-reality', license: 'CC BY-SA 4.0' },
    { title: 'Satellite', artist: 'SyntheticBabka', genre: 'Electronic', src: 'https://archive.org/download/various-artists-united-in-dust-reality/10.SyntheticBabka%20-%20Satellite.mp3', cover: 'https://archive.org/services/img/various-artists-united-in-dust-reality', license: 'CC BY-SA 4.0' },
    { title: 'lofi hip hop radio — beats to relax/study to', artist: 'Lofi Girl', genre: 'Lo-Fi', ytId: '5qap5aO4i9A', cover: 'https://i.ytimg.com/vi/5qap5aO4i9A/hqdefault.jpg', license: 'YouTube embed' },
    { title: 'lofi hip hop radio — beats to sleep/chill to', artist: 'Lofi Girl', genre: 'Lo-Fi', ytId: 'DWcJFNfaw9c', cover: 'https://i.ytimg.com/vi/DWcJFNfaw9c/hqdefault.jpg', license: 'YouTube embed' },
    { title: 'synthwave radio — beats to chill/game to', artist: 'Lofi Girl', genre: 'Lo-Fi', ytId: '4xDzrJKXOOY', cover: 'https://i.ytimg.com/vi/4xDzrJKXOOY/hqdefault.jpg', license: 'YouTube embed' },
    { title: 'Bhoy Kete Jabe', artist: 'Swarobanjo', genre: 'Bangla', src: 'https://archive.org/download/hawar-chithi/Bhoy%20Kete%20Jabe%20-%20Swarobanjo.mp3', cover: 'https://archive.org/services/img/hawar-chithi', license: 'CC BY-NC-SA 4.0' },
    { title: 'Gaandib', artist: 'Swarobanjo', genre: 'Bangla', src: 'https://archive.org/download/hawar-chithi/Gandeeb%20-%20Swarobanjo.mp3', cover: 'https://archive.org/services/img/hawar-chithi', license: 'CC BY-NC-SA 4.0' },
    { title: 'Maa', artist: 'Swarobanjo', genre: 'Bangla', src: 'https://archive.org/download/hawar-chithi/Maa%20-%20Swarobanjo.mp3', cover: 'https://archive.org/services/img/hawar-chithi', license: 'CC BY-NC-SA 4.0' },
    { title: 'Mangrover Kanna', artist: 'Swarobanjo', genre: 'Bangla', src: 'https://archive.org/download/hawar-chithi/Mangrove%20er%20kanna%20-%20Swarobanjo.mp3', cover: 'https://archive.org/services/img/hawar-chithi', license: 'CC BY-NC-SA 4.0' },
    { title: 'Manush', artist: 'Aadhpagla', genre: 'Bangla', src: 'https://archive.org/download/hawar-chithi/Manush%20-%20Aadhpagla.mp3', cover: 'https://archive.org/services/img/hawar-chithi', license: 'CC BY-NC-SA 4.0' },
    { title: 'Hei Samhalo (Salil Chowdhury Cover)', artist: 'Swarobanjo', genre: 'Bangla', src: 'https://archive.org/download/hawar-chithi/Hei%20Sambhalo%20(Salil%20Chowdhury%20Cover)%20.mp3', cover: 'https://archive.org/services/img/hawar-chithi', license: 'CC BY-NC-SA 4.0' },
    { title: 'Shob Lokey Koy', artist: 'Coke Studio Bangla', genre: 'Bangla', ytId: 'L-arhlgPiy8', cover: 'https://i.ytimg.com/vi/L-arhlgPiy8/hqdefault.jpg', license: 'YouTube embed' },
    { title: 'Nish — Baul Medley', artist: 'Nish', genre: 'Bangla', ytId: 'Q4rT6jyX-nE', cover: 'https://i.ytimg.com/vi/Q4rT6jyX-nE/hqdefault.jpg', license: 'YouTube embed' },
    { title: 'Sujon Janiya Korio Piriti', artist: 'Bangla Folk', genre: 'Bangla', ytId: 'j-TdLvTYgu4', cover: 'https://i.ytimg.com/vi/j-TdLvTYgu4/hqdefault.jpg', license: 'YouTube embed' },
    { title: 'Kabhi Kabhie Mere Dil Mein', artist: 'Mukesh', genre: 'Bollywood', ytId: 'g_O5lttb5ww', cover: 'https://i.ytimg.com/vi/g_O5lttb5ww/hqdefault.jpg', license: 'YouTube embed' },
    { title: 'Tujhse Naraaz Nahin Zindagi', artist: 'Anup Ghoshal', genre: 'Bollywood', ytId: 'LZ_YUOr-tYw', cover: 'https://i.ytimg.com/vi/LZ_YUOr-tYw/hqdefault.jpg', license: 'YouTube embed' },
    { title: 'Ek Pyar Ka Nagma Hai', artist: 'Lata Mangeshkar', genre: 'Bollywood', ytId: 'H2BTCPW3Hw8', cover: 'https://i.ytimg.com/vi/H2BTCPW3Hw8/hqdefault.jpg', license: 'YouTube embed' },
    { title: 'Chaiyya Chaiyya', artist: 'A. R. Rahman', genre: 'Bollywood', ytId: 'K-pX4qwtAxA', cover: 'https://i.ytimg.com/vi/K-pX4qwtAxA/hqdefault.jpg', license: 'YouTube embed' },
    { title: 'Kabhi Alvida Naa Kehna', artist: 'Sonu Nigam & Alka Yagnik', genre: 'Bollywood', ytId: 'O8fIwHfZz2E', cover: 'https://i.ytimg.com/vi/O8fIwHfZz2E/hqdefault.jpg', license: 'YouTube embed' },
    { title: 'Tum Hi Ho', artist: 'Arijit Singh', genre: 'Bollywood', ytId: 'Umqb9KENgmk', cover: 'https://i.ytimg.com/vi/Umqb9KENgmk/hqdefault.jpg', license: 'YouTube embed' }
  ] as MusicTrack[],
  locations: [
    { id: 'puran-dhaka', name: 'Puran Dhaka', region: 'Old Dhaka', panorama: 'https://upload.wikimedia.org/wikipedia/commons/d/db/Rickshaw_Parking_at_Dhaka_%289601873282%29.jpg', license: 'CC BY-SA 2.0', lat: 23.7104, lng: 90.4074, ambient: 'city' },
    { id: 'lalbagh', name: 'Lalbagh Fort', region: 'Old Dhaka', panorama: 'https://upload.wikimedia.org/wikipedia/commons/7/77/Lalbagh_Fort_panorama_%28Fort_Aurangabad%29.jpg', license: 'CC BY-SA 4.0', lat: 23.7186, lng: 90.3882, ambient: 'city' },
    { id: 'ahsan-manzil', name: 'Ahsan Manzil', region: 'Old Dhaka', panorama: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Front_Side_Of_Ahsan_Manzil_1.jpg', license: 'CC BY-SA 4.0', lat: 23.7086, lng: 90.4061, ambient: 'river' },
    { id: 'sadarghat', name: 'Sadarghat', region: 'Old Dhaka', panorama: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Sadarghat_panorama.jpg', license: 'CC BY-SA 4.0', lat: 23.7025, lng: 90.4113, ambient: 'river' },
    { id: 'shankhari', name: 'Shankhari Bazar', region: 'Old Dhaka', panorama: 'https://upload.wikimedia.org/wikipedia/commons/2/22/Morning_Visit_to_Sadarghat_Launch_Terminal_%2849583201916%29.jpg', license: 'CC BY 2.0', lat: 23.7115, lng: 90.4128, ambient: 'city' },
    { id: 'parliament', name: 'Parliament House', region: 'New Dhaka', panorama: 'https://upload.wikimedia.org/wikipedia/commons/2/21/Panorama_of_National_Assembly_of_Bangladesh_%2802%29.jpg', license: 'CC BY-SA 4.0', lat: 23.7636, lng: 90.3787, ambient: 'urban' },
    { id: 'dhanmondi', name: 'Dhanmondi Lake', region: 'New Dhaka', panorama: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Hatirjheel_Amphitheatre_Vivid_2025-March-07_%28cropped%29.jpg', license: 'CC BY 4.0', lat: 23.7461, lng: 90.3742, ambient: 'urban' },
    { id: 'hatirjheel', name: 'Hatirjheel', region: 'New Dhaka', panorama: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Hatirjheel_Amphitheatre_Vivid_2025-March-07_%28cropped%29.jpg', license: 'CC BY 4.0', lat: 23.7513, lng: 90.4007, ambient: 'urban' },
    { id: 'coxsbazar', name: 'Cox’s Bazar', region: 'Chattogram', panorama: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Coxs_Bazar_Beach_Panorama_View_2022.jpg', license: 'CC BY-SA 4.0', lat: 21.4272, lng: 92.0058, ambient: 'sea' },
    { id: 'sundarbans', name: 'Sundarbans', region: 'Khulna', panorama: 'https://upload.wikimedia.org/wikipedia/commons/4/43/Panorama_of_Riverbank_at_Low_Tide%2C_Sundarbans_District%2C_South_of_Kolkata%2C_India_%2812355640965%29.jpg', license: 'CC BY-SA 2.0', lat: 21.9497, lng: 89.1833, ambient: 'forest' },
    { id: 'srimangal', name: 'Srimangal Tea Gardens', region: 'Sylhet', panorama: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Panorama_of_Zareen_Tea_Estate_-_Near_Srimangal_-_Sylhet_Division_-_Bangladesh_%2812950335064%29.jpg', license: 'CC BY-SA 2.0', lat: 24.3065, lng: 91.7292, ambient: 'tea' },
    { id: 'tokyo', name: 'Tokyo — Tokiwa-so', region: 'World', panorama: 'https://upload.wikimedia.org/wikipedia/commons/0/03/Memorial_for_Tokiwa-so_apartment_house.jpg', license: 'CC BY 2.0', lat: 35.7295, lng: 139.7109, ambient: 'urban' },
    { id: 'paris', name: 'Paris — Place Vendôme', region: 'World', panorama: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Place_Vend%C3%B4me%2C_Paris_March_2007.jpg', license: 'CC BY-SA 2.0', lat: 48.8675, lng: 2.3294, ambient: 'urban' },
    { id: 'venice', name: 'Venice — Piazza San Marco', region: 'World', panorama: 'https://upload.wikimedia.org/wikipedia/commons/b/b2/Panorama_Piazza_San_Marco_and_Venice_on_Easter_2013.jpg', license: 'CC BY-SA 3.0', lat: 45.4342, lng: 12.3388, ambient: 'sea' },
    { id: 'santorini', name: 'Santorini — Imerovigli', region: 'World', panorama: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Imerovigli_Panoramic_360_View_-_Santorini.jpg', license: 'CC BY-SA 4.0', lat: 36.4326, lng: 25.4225, ambient: 'sea' },
    { id: 'himalayas', name: 'Himalayas — Leh', region: 'World', panorama: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Panorama_of_Himalayas_Leh_India.jpg', license: 'CC BY-SA 3.0', lat: 34.1526, lng: 77.5771, ambient: 'mountain' }
  ] as StreetLocation[],
  tracks: [
    { title: 'ASADCORE Vibes', subtitle: 'Original Mix · Generative', mood: 0.12, duration: 222 },
    { title: 'Deep Thoughts', subtitle: 'Nocturne · Generative', mood: 0.38, duration: 252 },
    { title: 'Lost in the Deep', subtitle: 'Abyss Mix · Generative', mood: 0.72, duration: 307 },
    { title: 'City of Dreams', subtitle: 'Monsoon Mix · Generative', mood: 0.25, duration: 203 }
  ],
  incidents: [
    { id: '001', tag: 'UNVERIFIED', title: 'The city never sleeps', date: 'DHAKA · 02:13 AM', text: 'For seven nights, every clock in Old Dhaka stopped at 02:13. The rickshaw pullers say they heard a bell from a street that no longer exists. On the eighth night, the clocks started again. No one remembers winding them.', secret: true },
    { id: '002', tag: 'FIELD NOTE', title: 'A door in the rain', date: 'SHANKHARI BAZAR · 11:48 PM', text: 'A purple door appeared between two tea stalls during the monsoon. Those who entered returned with the same sentence on their lips: “Dhaka still remembers you.” The door was gone before the rain stopped.' },
    { id: '003', tag: 'ARCHIVE', title: 'The statue that dreamed', date: 'BURIGANGA · 04:06 AM', text: 'A fisherman found a marble face floating in the river. Its eyes were closed. That night, every radio in the quarter played the same unfamiliar chord. By morning, the face had become a constellation.' },
    { id: '004', tag: 'UNEXPLAINED', title: 'Last rickshaw to nowhere', date: 'NAZIRA BAZAR · 01:09 AM', text: 'The passenger asked to go to a place that was not on any map. The driver followed a narrow lane lit by violet lamps. He returned alone, holding a ticket dated one hundred years from now.' }
  ],
  whispers: ['You were never meant to find this…', 'Dhaka still remembers you…', 'এই শহর তোমাকে মনে রেখেছে…', 'The river knows your name…', 'You have been here before…', 'নক্ষত্রের ভিড়ে হারিয়ে যাও…', 'Some doors only open inward…', 'Listen. The silence is alive…', 'তুমি কি আলোটা দেখতে পাচ্ছো?', 'Not all who fall are lost…'],
  layers: [
    { at: 0, name: 'SURFACE', color: '#8b3dff' }, { at: 150, name: 'ECHO ZONE', color: '#6f4dff' }, { at: 320, name: 'WHISPER LAYER', color: '#b44dff' }, { at: 520, name: 'FORGOTTEN CITY', color: '#d06bff' }, { at: 750, name: 'THE VOID', color: '#4968ff' }, { at: 1000, name: 'THE CORE', color: '#f0b6ff' }
  ],
  ticker: ['Dhaka’s old streets still whisper stories…', 'New vision: Lost in the City', 'Listen: ASADCORE Mix Vol. 1', 'Explore the forgotten history…', 'Somewhere, a rickshaw bell crosses a star…', 'The river remembers. Do you?']
};
export type IncidentItem = typeof CONFIG.incidents[number];
